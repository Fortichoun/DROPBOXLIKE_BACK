import crypto from 'crypto';
import mongoose, { Schema } from 'mongoose';
import mongooseKeywords from 'mongoose-keywords';
import { encrypt, decrypt } from '../utils/cryptoTools';

const roles = ['user', 'admin'];

const userSchema = new Schema({
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
    index: true,
    trim: true,
  },
  password: String,
  services: {
    github: String,
  },
  folderName: String,
  role: {
    type: String,
    enum: roles,
    default: 'user',
  },
  picture: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

userSchema.path('email').set(function path(email) {
  if (!this.picture || this.picture.indexOf('https://gravatar.com') === 0) {
    const hash = crypto.createHash('md5').update(email).digest('hex');
    this.picture = `https://gravatar.com/avatar/${hash}?d=identicon`;
  }

  this.folderName = email.replace(/^(.+)@.+$/, '$1') + crypto.randomBytes(20).toString('hex');

  return email;
});

userSchema.path('password').set(password => encrypt(password));

userSchema.path('password').get(password => decrypt(password));

userSchema.methods = {
  view(full) {
    const view = {};
    let fields = ['email', 'folderName', 'picture'];

    if (full) {
      fields = [...fields, 'createdAt', 'id'];
    }

    fields.forEach((field) => { view[field] = this[field]; });

    return view;
  },
};

userSchema.statics = {
  roles,

  createFromService({
    service, id, email, name, picture,
  }) {
    return this.findOne({ $or: [{ [`services.${service}`]: id }, { email }] }).then((user) => {
      if (user) {
        const userFromService = this(user);
        userFromService.services[service] = id;
        userFromService.name = name;
        userFromService.picture = picture;
        return userFromService.save();
      }
      return this.create({
        services: { [service]: id }, email, name, picture,
      });
    });
  },
};

userSchema.plugin(mongooseKeywords, { paths: ['email', 'name'] });

const model = mongoose.model('User', userSchema);

export const { schema } = model;
export default model;
