const {Order, cartItem} = require('../models/order')
const {errorHandler} = require('../helpers/dbErrorHandler')

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

exports.orderById = (req, res, next, id) => {
    Order.findById(id)
        .populate('products.product', 'name price')
        .exec((err, order) => {
            if (err || !order) {
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            req.order = order
            next()
        })
}


exports.create = (req, res) => {
    req.body.order.user = req.profile
    const user = req.body.order.user
    console.log('USER', user)
    console.log('body', req.body)
    console.log('profile', req.profile)

    const order = new Order(req.body.order)
    order.save((error, data) => {
        if (error) {
            return res.status(400).json({
                error: errorHandler(error)
            })
        }

        const emailData = {
            to: 'team@lucidha.us',
            from: 'no-reply@hyphajs.com',
            subject: `A new order is received`,
            html: `
            <p>Customer name: ${!!user ? req.body.order.user.name : 'Guest User'}</p>
            <p>Customer email: ${req.body.order.email}</p>
            <p>Total products: ${order.products.length}</p>
            <p>Total cost: $ ${order.amount}</p>
            <p>Login to dashboard to the order in detail.</p>`
        }
        sgMail.send(emailData)

        const customerReceipt = {
            to: !!user ? req.body.order.user.email : req.body.order.email,
            from: 'no-reply@hyphajs.com',
            subject: `Thanks for your purchase!`,
            html: `
            <p>Customer name: ${!!user ? req.body.order.user.name : 'Guest'}</p>
            <p>Total products: ${order.products.length}</p>
            <p>Total cost: ${order.amount}</p>
            <p>You can check on the status of your order here</p>`
        }
        sgMail.send(customerReceipt)

        res.json(data)
    })
}

exports.listOrders = (req, res) => {
    Order.find()
        .populate('user', '_id name address')
        .sort('-createdAt')
        .exec((err, orders) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            res.json(orders)
        })
}

exports.getStatusValues = (req, res) => {
    res.json(Order.schema.path('status').enumValues)
}

exports.updateOrderStatus = (req, res) => {
    Order.updateOne({_id: req.body.orderId}, {$set: {status: req.body.status}},
        (err, order) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            res.json(order)
        }
    )
}