import axios from 'axios'
import Noty from 'noty'
import { initAdmin } from './admin'
import moment from 'moment'
// import { initStripe } from './stripe'

let addToCart = document.querySelectorAll('.add-to-cart')
let cartCounter = document.querySelector('#cartCounter')

function updateCart(products) {
   axios.post('/update-cart', products).then(res => {
       cartCounter.innerText = res.data.totalQty
       new Noty({
           type: 'success',
           timeout: 1000,
           text: 'Đã thêm vào giỏ hàng',
           progressBar: false,
       }).show();
   }).catch(err => {
       new Noty({
           type: 'error',
           timeout: 1000,
           text: 'Có gì đó không ổn!',
           progressBar: false,
       }).show();
   })
}



addToCart.forEach((btn) => {
   btn.addEventListener('click', (e) => {
       let products = JSON.parse(btn.dataset.product)
       updateCart(products)
   })
})

// Remove alert message after 2 seconds
const alertMsgsc = document.querySelector('#success-alert')
if(alertMsgsc) {
   setTimeout(() => {
       alertMsgsc.remove()
   }, 2000)
}
const alertMsgerr = document.querySelector('#error-alert')
if(alertMsgerr) {
   setTimeout(() => {
    alertMsgerr.remove()
   }, 2000)
}


// Ajax call
// const paymentForm = document.querySelector('#payment-form');
// if(paymentForm){
//     paymentForm.addEventListener('submit', (e) =>{
//         e.preventDefault();
//         let formData = new FormData(paymentForm);
//         let formobject = {}
//         for(let [key, value] of formData.entries ()){
//           formobject[key] = value
//         }
//         axios.post('/orders', formobject).then((res) => {
//             new Noty({
//                 type: 'success',
//                 timeout: 1000,
//                 text: res.data.message,
//                 progressBar: false,
//             }).show();

//             setTimeout(() => {
//                 window.location.href = '/customer/orders'
//             }, 2000);
            
//         }).catch((err) => {
//             new Noty({
//                 type: 'error',
//                 timeout: 1000,
//                 text: err.res.data.message,
//                 progressBar: false,
//             }).show();
//         })
//         console.log(formobject);
//       })
// }


// Change order status
let statuses = document.querySelectorAll('.status_line')
let hiddenInput = document.querySelector('#hiddenInput')
let order = hiddenInput ? hiddenInput.value : null
order = JSON.parse(order)
let time = document.createElement('small')

function updateStatus(order) {
   statuses.forEach((status) => {   //remove active old order status front-end
       status.classList.remove('step-completed') 
       status.classList.remove('current') 
   })
   let stepCompleted = true;
   statuses.forEach((status) => {
      let dataProp = status.dataset.status
      if(stepCompleted) {
           status.classList.add('step-completed')
      }
      if(dataProp === order.status) {
           stepCompleted = false
           time.innerText = moment(order.updatedAt).format('hh:mm A')
           status.appendChild(time)
          if(status.nextElementSibling) {
           status.nextElementSibling.classList.add('current')
          }
      }
   })

}
updateStatus(order);


// Socket
let socket = io()

// Join
if(order) {
   socket.emit('join', `order_${order._id}`)
}
let adminAreaPath = window.location.pathname
if(adminAreaPath.includes('admin')) {
   initAdmin(socket)
   socket.emit('join', 'adminRoom')
}

socket.on('orderUpdated', (data) => {
   const updatedOrder = { ...order }
   updatedOrder.updatedAt = moment().format()
   updatedOrder.status = data.status
   updateStatus(updatedOrder)
   new Noty({
       type: 'success',
       timeout: 1000,
       text: 'Đơn hàng đã được cập nhật',
       progressBar: false,
   }).show();
})