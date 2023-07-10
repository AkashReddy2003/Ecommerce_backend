const express=require("express");
const cors=require("cors");
const app=express();
const mongoose=require("mongoose");
const User=require("./Models/User");
const Product=require('./Models/Product');
const Order=require('./Models/Order');


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));



const connectDB=async()=>{
    await mongoose.connect("mongodb+srv://akash:akash@cluster0.yee5ogm.mongodb.net/?retryWrites=true&w=majority")
    .then(()=>{
        console.log("connected to db");
    })
    .catch((e)=>{
        console.log(e);
    })
}
connectDB();



//User Apis

app.post('/user/login',async(req,res)=>{
    const {email, password} = req.body;
  try {
    const user = await User.findByCredentials(email, password);
    res.json({user,message:"success"});
  } catch (e) {
    res.status(400).send(e.message)
  }
})

app.post('/user/signup', async(req, res)=> {
    const {name, email, password,phone,address} = req.body;
    try {
      let user = await User.create({name, email, password,phone,address});
      user = await User.findByCredentials(email, password);
      res.json({user,message:"success"});
    } catch (e) {
      if(e.code === 11000) return res.status(400).send('Email already exists');
      res.status(400).send(e.message)
    }
  })

  app.get('/user/clients', async(req, res)=> {
    try {
      const users = await User.find({ role: "client" }).populate('orders');
      res.json(users);
    } catch (e) {
      res.status(400).send(e.message);
    }
  })
  app.get('/user/drivers', async(req, res)=> {
    try {
      const users = await User.find({ role: "driver" });
      res.json(users);
    } catch (e) {
      res.status(400).send(e.message);
    }
  })

  app.get('/user/:id/orders', async (req, res)=> {
    const {id} = req.params;
    try {
      const user = await User.findById(id).populate('orders');
      res.json(user.orders);
    } catch (e) {
      res.status(400).send(e.message);
    }
  })
  app.patch('/user/:id/convert_to_driver', async (req, res)=> {
    const {id} = req.params;
    try {
        const user = await User.findByIdAndUpdate(id, {role:"driver"});
      res.json(user);
    } catch (e) {
      res.status(400).send(e.message);
    }
  })

  app.patch('/user/:id/convert_to_client', async (req, res)=> {
    const {id} = req.params;
    try {
        const user = await User.findByIdAndUpdate(id, {role:"client"});
      res.json(user);
    } catch (e) {
      res.status(400).send(e.message);
    }
  })

  app.get('/user/:id',async(req,res)=>{
    const {id}=req.params;
    const user=await User.findById(id);
    res.json(user);
  })





  //Product Apis


  app.post('/product', async(req, res)=> {
    try {
      const {name, stock, price, category, pictures} = req.body;
      const product = await Product.create({name, stock, price, category, pictures});
      const products = await Product.find();
      res.status(201).json(products);
    } catch (e) {
      res.status(400).send(e.message);
    }
  })


  app.get('/product', async(req, res)=> {
    try {
      const sort = {'_id': -1}
      const products = await Product.find().sort(sort);
      res.status(200).json(products);
    } catch (e) {
      res.status(400).send(e.message);
    }
  })

  app.patch('/product/:id', async(req, res)=> {
    const {id} = req.params;
    try {
      const {name, stock, price, category, pictures} = req.body;
      const product = await Product.findByIdAndUpdate(id, {name, stock, price, category, pictures});
      const products = await Product.find();
      res.status(200).json(products);
      console.log("Updated")
    } catch (e) {
      res.status(400).send(e.message);
    }
  })


  app.delete('/product/:id', async(req, res)=> {
    const {id} = req.params;
    const {user_id} = req.body;
    try {
      const user = await User.findById(user_id);
      await Product.findByIdAndDelete(id);
      const products = await Product.find();
      res.status(200).json(products);
    } catch (e) {
      res.status(400).send(e.message);
    }
  })

  app.get('/product/category/:category', async(req,res)=> {
    const {category} = req.params;
    try {
      let products;
      const sort = {'_id': -1}
      if(category == "all"){
        products = await Product.find().sort(sort);
      } else {
        products = await Product.find({category}).sort(sort)
      }
      res.status(200).json(products)
    } catch (e) {
      res.status(400).send(e.message);
    }
  })

  app.get('/product/categories',async(req,res)=>{
    const cat=await Product.distinct('category');
    res.json(cat);
  })


  app.post('/product/add-to-cart', async(req, res)=> {
    const {userId, productId, price} = req.body;
    try {
      const user = await User.findById(userId);
      const userCart = user.cart;
      if(user.cart[productId]){
        userCart[productId] += 1;
      } else {
        userCart[productId] = 1;
      }
      userCart.count += 1;
      userCart.total = Number(userCart.total) + Number(price);
      user.cart = userCart;
      user.markModified('cart');
      await user.save();
      res.status(200).json(user);
    } catch (e) {
      res.status(400).send(e.message);
    }
  })


  app.post('/product/increase-cart', async(req, res)=> {
    const {userId, productId, price} = req.body;
    try {
      const user = await User.findById(userId);
      const userCart = user.cart;
      userCart.total += Number(price);
      userCart.count += 1;
      userCart[productId] += 1;
      user.cart = userCart;
      user.markModified('cart');
      await user.save();
      res.status(200).json(user);
    } catch (e) {
      res.status(400).send(e.message);
    }
  });
  
  app.post('/product/decrease-cart', async(req, res)=> {
    const {userId, productId, price} = req.body;
    try {
      const user = await User.findById(userId);
      const userCart = user.cart;
      userCart.total -= Number(price);
      userCart.count -= 1;
      userCart[productId] -= 1;
      user.cart = userCart;
      user.markModified('cart');
      await user.save();
      res.status(200).json(user);
    } catch (e) {
      res.status(400).send(e.message);
    }
  })
  
  app.post('/product/remove-from-cart', async(req, res)=> {
    const {userId, productId, price} = req.body;
    try {
      const user = await User.findById(userId);
      const userCart = user.cart;
      userCart.total -= Number(userCart[productId]) * Number(price);
      userCart.count -= userCart[productId];
      delete userCart[productId];
      user.cart = userCart;
      user.markModified('cart');
      await user.save();
      res.status(200).json(user);
    } catch (e) {
      res.status(400).send(e.message);
    }
  })



  //Order Apis

  app.post('/order', async(req, res)=> {
    const {userId, cart, address} = req.body;
    try {
      const user = await User.findById(userId);
      const order = await Order.create({owner: user._id, products: cart, address});
      order.count = cart.count;
      order.total = cart.total;
      await order.save();
      let car=await Product.find({});
      car=car.filter((p)=>user.cart[p._id]!=null);
      car.forEach(async(element) => {
        const p=await Product.findByIdAndUpdate(element._id,{stock:Number(Number(element.stock)-Number(user.cart[element._id.toString()]))});
        if(p.stock==0){
          await Product.findByIdAndDelete(element._id);
        }
        
      });

      user.cart =  {total: 0, count: 0};
      user.orders.push(order);
      user.markModified('orders');
      await user.save();
      res.status(200).json(user)
  
    } catch (e) {
      res.status(400).json(e.message)
    }
  })

  app.get('/order', async(req, res)=> {
    try {
      const orders = await Order.find().populate('owner', ['email', 'name']);
      res.status(200).json(orders);
    } catch (e) {
      res.status(400).json(e.message)
    }
  })


  app.patch('/order/:id/mark-shipped', async(req, res)=> {
    const {ownerId,driverId} = req.body;
    const {id} = req.params;
    try {
      const user = await User.findById(ownerId);
      await Order.findByIdAndUpdate(id, {status: 'shipped',driver:driverId});
      const orders = await Order.find().populate('owner', ['email', 'name']);
      await user.save();
      res.status(200).json(orders)
    } catch (e) {
      res.status(400).json(e.message);
    }
  })

  app.patch('/order/:id/mark-delivered', async(req, res)=> {
    const {ownerId,driverId} = req.body;
    const {id} = req.params;
    try {
      const user = await User.findById(ownerId);
      await Order.findByIdAndUpdate(id, {status: 'delivered',driver:driverId});
      const orders = await Order.find().populate('owner', ['email', 'name']);
      await user.save();
      res.status(200).json(orders)
    } catch (e) {
      res.status(400).json(e.message);
    }
  })



app.listen(8000,()=>{
    console.log("Listening")
})