import React, { useState, useEffect } from 'react';
import {
    getBraintreeClientToken,
    processPayment,
    createOrder
} from './apiCore';
import { emptyCart } from './cartHelpers';
import { isAuthenticated } from '../auth';
import { Link } from 'react-router-dom';
import DropIn from 'braintree-web-drop-in-react';

const Checkout = ({products, setRun = f => f, run = undefined}) => {

    const [data, setData] = useState({
        loading: false,
        success: false,
        clientToken: null,
        error: '',
        instance: {},
        address: ''
    });

    const userId = isAuthenticated() && isAuthenticated().user._id;
    const token = isAuthenticated() && isAuthenticated().token;

    const getToken = (userId, token) => {
        getBraintreeClientToken(userId, token).then(data => {
            if(data.error) {
                setData({...data, error: data.error})
            } else {
                setData({clientToken: data.clientToken})
            }
        })
    }

    useEffect(() => {
        getToken(userId, token);
    }, [])

    const getTotal = () => {
        return products.reduce((currentValue, nextValue) => {
            return currentValue + nextValue.count * nextValue.price
        }, 0);
    }

    const showCheckout = () => {
        return isAuthenticated() ? (
            <div>{showDropIn()}</div>
        ) : (
            <Link to="/signin">
                Plase signin to checkout
            </Link>
        );
    };

    const showLoading = loading => loading && <h2>Loding ...</h2>;

    let deliveryAddress = data.address;

    const buy = () => {
        // sned the nonce to your server
        // nonce = data.instance.requestPaymentMethod()
        setData({loading: true})
        let nonce;
        let getNonce = data.instance
        .requestPaymentMethod()
        .then(data => {
            nonce = data.nonce;
            // once you have nonce (card type, card number) send nonce as 'paymentMethodNonce'
            const paymentData = {
                paymentMethodNonce: nonce,
                amount: getTotal(products)
            }
            processPayment(userId, token, paymentData)
            .then(response => {
                setData({...data, success: response.success});
                // empty cart
                // create order


                const createOrderData = {
                    products: products,
                    transaction_id: response.transaction.id,
                    amount: response.transaction.amount,
                    address: deliveryAddress
                }

                createOrder(userId, token, createOrderData);

                emptyCart(() => {
                    setRun(!run);
                    setData({
                        loading: false,
                        success: true
                    })
                })
            })
            .catch(err => {
                console.log(err);
                setData({loading: false});
            });
        })
        .catch(error => {
            setData({...data, error: error.message});
        })
    };

    const showSuccess = success => {
        return <div
            className="alert alert-info"
            style={{ display: success ? "" : "none"}}
        >
            Thanks! Your payment was successful
        </div>
    }

    const handleAddress = event => {
        setData({...data, address: event.target.value});
    }


    const showDropIn = () => (
        <div onBlur={() => setData({...data, error: ""})}>
            {
                data.clientToken !== null && products.length > 0 ? (
                    <div>
                        <div className="form-group mb-3">
                            <label className="text-muted">Delivery address:</label>
                            <textarea
                                onChange={handleAddress}
                                className="form-control"
                                value={data.address}
                                placeholder="Type your delivery address here..."
                            />
                        </div>
                        <DropIn
                            options={{
                                authorization: data.clientToken,
                                paypal: {
                                    flow: 'vault'
                                }
                            }}
                            onInstance={instance => (data.instance) = instance}
                        />
                        <button onClick={buy} className="btn btn-success">Pay</button>
                    </div>
                ): null
            }
        </div>
    );

    const showError = err => (
        <div className="alert alert-danger" style={{display: err ? '': 'none'}} >
            {err}
        </div>
    )
    return (
        <div>
            <h2>Total: ${getTotal()} </h2>
            {showLoading(data.loading)}
            {showSuccess(data.success)}
            {showError(data.error)}
            {showCheckout()}
        </div>
    )
}

export default Checkout;