const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({

  name: {
    type: String,
    required: [true, 'is required']
  },

  email: {
    type: String,
    required: [true, 'is required'],
    unique: true,
    index: true,
    validate: {
      validator: function(str){
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(str);
      },
      message: props => `${props.value} is not a valid email`
    }
  },

  password: {
    type: String,
    required: [true, 'is required']
  },

  role: {
    type: String,
    default: "client"
  },
  address:{
    type: String,
    required: [true, 'is required']
  },
  phone:{
    type: String,
    required: [true, 'is required']
  },

  cart: {
    type: Object,
    default: {
      total: 0,
      count: 0
    }
  },

  orders: [{type: mongoose.Schema.Types.ObjectId, ref: 'Order'}]

}, {minimize: false});


UserSchema.statics.findByCredentials = async function(email, password) {
  const user = await User.findOne({email});
  if(!user) throw new Error('invalid credentials');
  const isSamePassword = (password===user.password);
  if(isSamePassword) return user;
  throw new Error('invalid credentials');
}



const User = mongoose.model('User', UserSchema);

module.exports = User;