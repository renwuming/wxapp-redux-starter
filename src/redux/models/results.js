import Promise from '../../vendors/es6-promise.js';
import { normalize, arrayOf } from '../../vendors/normalizr.min.js';

import { updateObject } from '../../libs/utils.js';
import { GET, POST } from '../../libs/request.js';

import { postSchema, resultsSchema } from '../schema.js';

// ------------------------------------
// Constants
// ------------------------------------
export const UPDATE_RESULTS_LIST = 'UPDATE_RESULTS_LIST';
export const REPLACE_RESULTS_LIST = 'REPLACE_RESULTS_LIST';
// ------------------------------------
// helpers
// ------------------------------------


function handleResults(posts) {
    let results = posts.results,
         papers = posts.papers,
         normalizePapers, normalizeResults;

    normalizePapers = normalize(papers, arrayOf(postSchema));
    normalizeResults = normalize(results, arrayOf(resultsSchema));

    return updateObject(normalizePapers, normalizeResults);
}

function handleResults2(results) {
    let normalizeResults;

    normalizeResults = normalize(results, arrayOf(resultsSchema));

    return normalizeResults;
}

// ------------------------------------
// Actions
// ------------------------------------
export function updateResultsList(normalizeData, lastkey = null, hasmore = null, hasmore_friend = null) {
    return {
        type: UPDATE_RESULTS_LIST,
        payload: {
            normalizeData: normalizeData,
            listLastkey: lastkey,
            hasmore,
            hasmore_friend,
        }
    }
}
export function replaceResultsList(normalizeData, lastkey = null, hasmore = null, hasmore_friend = null) {
    return {
        type: REPLACE_RESULTS_LIST,
        payload: {
            normalizeData: normalizeData,
            listLastkey: lastkey,
            hasmore,
            hasmore_friend,
        }
    }
}


// ------------------------------------
// Async Actions
// ------------------------------------
export const dispatchResultList = (feeds) => {
    return (dispatch, getState) => {
        let normalizeData = {
                result: []
            };
        normalizeData = handleResults(feeds);

        dispatch(updateResultsList(
            normalizeData,
        ));

        return Promise.resolve();
    }

}
export const fetchResultList = (errorCallback, init) => {
    return (dispatch, getState) => {
        let state = getState(),
             results = state.results,
             sessionid = state.entities.sessionid,
             lastkey = init ? 0 : results.listLastkey || 0,
             url = `/test/results/${lastkey}`;

        return GET(url, { sessionid }, 500)
            .then(function(res) {
                if(res.errMsg) return Promise.reject(res.errMsg);
                let feeds = res.feeds,
                    lastkey = res.last_key,
                    hasmore = res.has_more,
                    normalizeData = {
                        result: []
                    };

                normalizeData = handleResults(feeds);

                if(init) {
                    dispatch(replaceResultsList(
                        normalizeData,
                        lastkey,
                        hasmore
                    ));
                } else {
                    dispatch(updateResultsList(
                        normalizeData,
                        lastkey,
                        hasmore
                    ));
                }
            }).catch(function(err) {
                err = err.toString();
                errorCallback && errorCallback(err);
                console.error(err);
            });
    }
}

export const fetchFriendResultList = (params, errorCallback, init) => {
    return (dispatch, getState) => {
        let state = getState(),
            results = state.results,
            sessionid = state.entities.sessionid,
            lastkey = init ? 0 : results.listLastkey || 0,
            url = `/test/results/${lastkey}`;

        return GET(url, params, 500)
            .then(function(res) {
                if(res.errMsg) return Promise.reject(res.errMsg);
                let feeds = res.feeds,
                    lastkey = res.last_key,
                    hasmore_friend = res.has_more,
                    normalizeData = {
                        result: []
                    };

                normalizeData = handleResults(feeds);

                if(init) {
                    dispatch(replaceResultsList(
                        normalizeData,
                        lastkey,
                        null,
                        hasmore_friend,
                    ));
                } else {
                    dispatch(updateResultsList(
                        normalizeData,
                        lastkey,
                        null,
                        hasmore_friend,
                    ));
                }
                console.log(res)
            }).catch(function(err) {
                err = err.toString();
                errorCallback && errorCallback(err);
                console.error(err);
            });
    }
}

export const fetchResultRecord = (id) => {
    return (dispatch, getState) => {
        let state = getState(),
             detail = state.entities.resultDetails[id],
             url = `/test/result/record`,
             normalizeData;

        return POST(url, { id })
            .then(function(res) {

                if(detail.record_count) detail.record_count++;
                else detail.record_count = 1;

                normalizeData = {
                    result: [],
                    entities: {
                        resultDetails: {
                            id: detail
                        }
                    }
                };

                dispatch(updateResultsList(
                    normalizeData
                ));

            }).catch(function(err) {
                err = err.toString();
                console.error(err);
            });
    }
}

export const fetchResultRecord2 = (id) => {
    return (dispatch, getState) => {
        let state = getState(),
             detail = state.entities.resultDetails[id],
             url = `/test/friendtest/result/record`,
             normalizeData;

        return POST(url, { id })
            .then(function(res) {

                if(detail.record_count) detail.record_count++;
                else detail.record_count = 1;

                normalizeData = {
                    result: [],
                    entities: {
                        resultDetails: {
                            id: detail
                        }
                    }
                };

                dispatch(updateResultsList(
                    normalizeData
                ));

            }).catch(function(err) {
                err = err.toString();
                console.error(err);
            });
    }
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
    [UPDATE_RESULTS_LIST]: (results, action) => {
        let payload = action.payload,
            normalizeData = payload.normalizeData,
            list = results.list.concat(normalizeData.result),
            listLastkey = payload.listLastkey,
            hasmore = payload.hasmore,
            hasmore_friend = payload.hasmore_friend,
            newObj = { list };
        // 忽略null
        (listLastkey !== null) && (newObj.listLastkey = listLastkey);
        (hasmore !== null) && (newObj.hasmore = hasmore);
        (hasmore_friend !== null) && (newObj.hasmore_friend = hasmore_friend);

        return updateObject(results, newObj);
    },
    [REPLACE_RESULTS_LIST]: (results, action) => {
        let payload = action.payload,
            normalizeData = payload.normalizeData,
            list = normalizeData.result,
            listLastkey = payload.listLastkey,
            hasmore = payload.hasmore,
            hasmore_friend = payload.hasmore_friend,
            newObj = { list };
        // 忽略null
        (listLastkey !== null) && (newObj.listLastkey = listLastkey);
        (hasmore !== null) && (newObj.hasmore = hasmore);
        (hasmore_friend !== null) && (newObj.hasmore_friend = hasmore_friend);

        return updateObject(results, newObj);
    }
}
// ------------------------------------
// Reducer
// ------------------------------------
export function resultsReducer(results = {
    list: [],
    listLastkey: 0,
    hasmore: true
}, action) {
    const handler = ACTION_HANDLERS[action.type]

    return handler ? handler(results, action) : results
}
