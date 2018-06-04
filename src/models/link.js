import crypto from 'crypto';
import mongoose, { Schema } from 'mongoose';
import mongooseKeywords from 'mongoose-keywords';
import { encrypt, decrypt } from '../utils/cryptoTools';

const linkSchema = new Schema({
  hash: {
    type: String,
    required: true,
    unique: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const model = mongoose.model('Link', linkSchema);

export const { schema } = model;
export default model;
