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


//判断是今天的，还是昨天的
function formatCount(posts){
    posts = posts.map((post) => {
        let publishTime = post.publish_time,
            nowDate, diffMinute;

        nowDate = new Date();
        diffMinute = (nowDate.getTime() / 1000 - publishTime) / 60;

        if (diffMinute <= nowDate.getHours() * 60) {
            post.today = true;
        } else {
            post.today = false;
        }

        return post;
    });

    return posts;
}

function handleResults(posts) {
    let results = [],
         papers = [],
         normalizePapers, normalizeResults;

    posts.map(e => {
        results.push(e.result);
        papers.push(e.paper);
    });

    normalizePapers = normalize(papers, arrayOf(postSchema));
    normalizeResults = normalize(results, arrayOf(resultsSchema));

    return updateObject(normalizePapers, normalizeResults);
}

// ------------------------------------
// Actions
// ------------------------------------
export function updateResultsList(normalizeData, lastkey = null, hasmore = null) {
    return {
        type: UPDATE_RESULTS_LIST,
        payload: {
            normalizeData: normalizeData,
            listLastkey: lastkey,
            hasmore
        }
    }
}
export function replaceResultsList(normalizeData, lastkey = null, hasmore = null) {
    return {
        type: REPLACE_RESULTS_LIST,
        payload: {
            normalizeData: normalizeData,
            listLastkey: lastkey,
            hasmore
        }
    }
}


// ------------------------------------
// Async Actions
// ------------------------------------

export const fetchResultList = (errorCallback, init) => {
    return (dispatch, getState) => {
        let state = getState(),
             results = state.results,
             sessionid = state.entities.sessionid,
             lastkey = init ? 0 : results.listLastkey || 0,
             url = `/test/results/${lastkey}`;

        return GET(url, { sessionid }, 500)
            .then(function(res) {
                let feeds = res.feeds,
                    lastkey = res.last_key,
                    hasmore = res.has_more,
                    normalizeData = {
                        result: []
                    },
                    posts;

                if(feeds && feeds.length){
                    posts = formatCount(feeds);

                    normalizeData = handleResults(posts);
                }
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
            }, function(err){
                errorCallback && errorCallback(err);
            }).catch(function(err) {
                errorCallback && errorCallback();
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
            newObj = { list };
        // 忽略null
        (listLastkey !== null) && (newObj.listLastkey = listLastkey);
        (hasmore !== null) && (newObj.hasmore = hasmore);

        return updateObject(results, newObj);
    },
    [REPLACE_RESULTS_LIST]: (results, action) => {
        let payload = action.payload,
            normalizeData = payload.normalizeData,
            list = normalizeData.result,
            listLastkey = payload.listLastkey,
            hasmore = payload.hasmore,
            newObj = { list };
        // 忽略null
        (listLastkey !== null) && (newObj.listLastkey = listLastkey);
        (hasmore !== null) && (newObj.hasmore = hasmore);

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
