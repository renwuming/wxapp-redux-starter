import { Schema, arrayOf } from '../vendors/normalizr.min.js';



const postSchema = new Schema('posts');
const qSchema = new Schema('questions');


postSchema.define({
    questions: arrayOf(qSchema)
});

export {
    postSchema,
}
