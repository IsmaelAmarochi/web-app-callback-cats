import {
    useState
} from "react";

import {
    Form,
    Button,
    Spinner,
    Alert
} from "react-bootstrap";

import {
    CardElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";
import {
    createPaymentIntent
} from "../../services/service";

const CheckoutForm = props => {
    const [succeeded, setSucceeded] = useState(false);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState("");
    const [disabled, setDisabled] = useState(true);
    const [billingDetails, setBillingDetails] = useState({
        name: "",
        email: "",
    });
    const stripe = useStripe();
    const elements = useElements();

    const handleChange = async event => {
        // Listen for changes in the CardElement
        // and display any errors as the customer types their card details
        setDisabled(event.empty);
        setError(event.error ? event.error.message : "");
    };

    const options = {
        iconStyle: "solid",
        style: {
            base: {
                iconColor: "black",
                color: "black",
                fontWeight: 500,
                fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
                fontSize: "16px",
                fontSmoothing: "antialiased",
                ":-webkit-autofill": {
                    color: "black"
                },
                "::placeholder": {
                    color: "black",
                }
            },
            invalid: {
                iconColor: "red",
                color: "red"
            }
        }
    }

    const handleSubmit = async event => {
        event.preventDefault();
        setProcessing(true);
        setSucceeded(false);
        setError(null);

        if (!stripe || !elements) return;
        else {
            createPaymentIntent(props.cart)
                .then(async response => {
                    const payload = await stripe.confirmCardPayment(response.data.clientSecret, {
                        payment_method: {
                            card: elements.getElement(CardElement)
                        }
                    });

                    if (payload.error) {
                        setError(`Payment failed ${payload.error.message}`);
                        setProcessing(false);
                    } else {

                        setError(null);
                        setProcessing(false);
                        setSucceeded(true);

                        props.emptyCart();
                        props.setStep(props.step + 1);
                    }
                });
        }
    }

    return (
        <div className="App">

            <div style={{ width: "fit-content", margin: "0 auto", padding: "1.5em" }}>
                <h1>Checkout - Pay</h1>
            </div>

            <div className="login">
                <Form onSubmit={handleSubmit}>

                    <Form.Group className="mb-3" controlId="formBasicName">
                        <Form.Label>Name and last name</Form.Label>
                        <Form.Control type="text" placeholder="Enter name and last name" />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control type="email" placeholder="Enter email" />
                        <Form.Text className="text-muted">
                            We'll never share your email with anyone else.
                        </Form.Text>
                    </Form.Group>

                    <div className="mb-3">
                        <CardElement options={options} onChange={handleChange} />
                    </div>

                    {processing ? (
                        <div style={{ display: "flex", justifyContent: "space-evenly", marginTop: "5em" }}>
                            <Spinner animation="border" />
                        </div>
                    ) : (
                        <div style={{ display: "flex", justifyContent: "space-evenly", margin: "5em 0" }}>
                            <Button variant="danger" onClick={() => props.setStep(props.step - 1)}>Terug</Button>
                            <Button variant="success" disabled={error || processing || disabled || succeeded}>
                                <span>Pay</span>
                            </Button>
                        </div>
                    )}
                    {error && (
                        <div>
                            <Alert variant="danger">
                                {error}
                            </Alert>
                        </div>
                    )}

                </Form>
            </div>
        </div>
    );
}

export default CheckoutForm;