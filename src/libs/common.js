import { GET, POST } from './request.js';

// 更新某测试题访问量
export const POST_RECORD = (id) => POST("/test/paper/record", {id});

export const GET_FRIENDTEST = (sessionid, level) => GET(`/test/friendtest/paper/${level}`, {sessionid});

export const UPDATE_Q = (body) => POST(`/test/friendtest`, body);

export const UPDATE_FRIEND_RESULT = (body) => POST(`/test/friendtest/result`, body);

export const GET_FRIENDTEST_ANSWERS = (sessionid) => GET(`/test/friendtest/results`, {sessionid});
