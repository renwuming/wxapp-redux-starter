import { GET, POST } from './request.js';

// 更新某测试题访问量
export const POST_RECORD = (id) => POST("/test/paper/record", {id});
