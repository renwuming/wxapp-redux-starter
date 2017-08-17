import { Schema, arrayOf } from '../vendors/normalizr.min.js';



const resultsSchema = new Schema('results');
const postSchema = new Schema('posts');
const qSchema = new Schema('questions');


postSchema.define({
    questions: arrayOf(qSchema)
});

export {
    postSchema,
    resultsSchema
}
