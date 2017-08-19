import { Schema, arrayOf } from '../vendors/normalizr.min.js';



const resultsSchema = new Schema('results');
const resultDetailsSchema = new Schema('resultDetails');
const postSchema = new Schema('posts');
const qSchema = new Schema('questions');


postSchema.define({
    questions: arrayOf(qSchema)
});

resultsSchema.define({
    list: arrayOf(resultDetailsSchema)
});

export {
    postSchema,
    resultsSchema
}
