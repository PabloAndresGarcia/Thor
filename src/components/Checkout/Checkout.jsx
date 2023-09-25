import { Timestamp, addDoc, collection, documentId, getDoc, query, where, writeBatch } from "firebase/firestore"
import CheckoutForm from '../CheckoutForm/CheckoutForm'
import { db } from "../service/firebase/firebaseConfig"
import { CartContext } from "../../context/CartContext"
import { useState } from "react"


const Checkout = () => {
    const [loading, setLoading] = useState(false)
    const [orderId, setOrderId] = useState('')

    const createOrder = async ({ name, phone, email}) => {
        setLoading(true)
        try{
            const objOrder = {
                buyer:{
                    name, phone, email
                },
                items: cart,
                total: total,
                date: Timestamp.fromDate(new Date())
            }
            const batch = writeBatch(db)
            const outOFStock = []

            const ids = cart.map(prod=>prod.id)
            const productsRef = collection(db, 'Productos')
            const productsAddedFromFirestore = await getDoc(query(productsRef, where(documentId(), 'in', ids)))

            const {docs} =productsAddedFromFirestore

            docs.forEach(doc =>{
                const dataDoc = doc.data()
                const stockDb = dataDoc.stockDb

                const productsAddedFromFirestore = cart.find( prod => prod.id === doc.id)
                const prodQuantity = productsAddedToCart?.quantity

                if (stockDb >= prodQuantity) {
                    batch.update(doc.ref, {stock: stockDb - prodQuantity})
                } else {
                    outOFStock.push({id: doc.id, ...dataDoc})
                }
            })
            if(outOFStock.length === 0){
                await batch.commit()

                const orderRef = collection(db, 'orders')

                const orderAdded = await addDoc(orderRef, objOrder)

                setOrderId(orderAdded.id)
                clearCart()
            } else {
                console.log('No hay productos que esten fuera de stock')
            }

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
    } 
    }

    if(loading) {
        return <h1>Se esta generando su orden...</h1>
    }

    if(orderId){
        return <h1>El id de su orden es: {orderId} </h1>
    }

    return (
        <div>
            <h1>Creckout</h1>
            <CheckoutForm onConfirm={createOrder} />
        </div>
    )
}

export default Checkout