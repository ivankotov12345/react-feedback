
import './App.css';

import React, { useState, useEffect } from "react";
import { Formik } from 'formik';

const apiFetch = async (addres) => {
  return await fetch(addres)
  .then((res) => res.json())
}

//☆ ★
const Form = ({name, formInfo, isFormVisible, closeForm, clearFunction}) => {
  
  const [rateFilled, setRateFilled] = useState(3);


const arrUnfilled = [1, 2, 3, 4, 5]


 const renderStars = (num) => {

  return arrUnfilled.map(star => (
    <p style={{margin: 0}} key={star} onClick = {() => setRateFilled(star)}>{star <= num ? "★" : "☆"}</p>
  ))
  
 }





  return(
    <Formik 
       initialValues={{ phone: '', commentary: '' }}
       validate={values => {
         const errors = {};
         if (!values.phone) {
           errors.phone = 'Required';
         } else if (
           !/^([\d+()\s]{3,10})$/.test(values.phone)
         ) {
           errors.phone = 'Invalid phone number';
         }
         if (!values.commentary) {
           errors.commentary = 'Required';
         }
         return errors;
       }}
       onSubmit={(values, { setSubmitting }) => {

           localStorage.setItem(name, JSON.stringify({...values, rate: rateFilled}))
           closeForm(name)
           setSubmitting(false);

       }}
     >
       {({
         values,
         errors,
         touched,
         handleChange,
         handleBlur,
         handleSubmit,
         isSubmitting,

       }) => (
         <div style={{display: 'flex', justifyContent:'center', marginTop: '20px'}}>
         {isFormVisible && <form onSubmit={handleSubmit} style={{position: "relative", padding: "10px", display: 'flex', flexDirection: 'column', width: "350px", border: "2px solid #000"}}>
            <p>Name</p>
            <p>{name}</p>
            <div style={{display:"flex", fontSize: "40px", color: 'yellow', cursor:"pointer"}}>{formInfo ? renderStars(formInfo.rate) : renderStars(rateFilled)}</div>
            <p>Phone</p>
            <div style={{position: "relative" , marginBottom: "20px"}}>
            <input 
             type="phone"
             name="phone"
             disabled = {!!formInfo}
             onChange={handleChange}
             onBlur={handleBlur}
             value={formInfo ? formInfo.phone : values.phone}
             style={{width: "100%"}}
           />
           <div style={{position: "absolute"}}>{errors.phone && touched.phone && errors.phone}</div>
            </div>

           <p>Commentary</p>
           <div style={{position: "relative", marginBottom: "20px"}}>
           <textarea
             disabled = {!!formInfo}
             style={{width: "100%", height: "150px"}}
             type="commentary"
             name="commentary"
             onChange={handleChange}
             onBlur={handleBlur}
             value={formInfo ? formInfo.commentary : values.commentary}
           />
           <div style={{position: "absolute"}}>{errors.commentary && touched.commentary && errors.commentary}</div>
           </div>
           <button type="submit" disabled={isSubmitting} style={{marginTop: "20px", width: "70px", alignSelf: "center"}}>
             Save
           </button>
           <button type='button' onClick={() =>{clearFunction(name)}} style={{position: "absolute", right: "10px", border: "none", color: "red", backgroundColor: "#fff"}}>clear</button>
         </form>}
         </div>
       )}
     </Formik>
  )
}


function App() {

  const [isLoading, setIsLoading] = useState(false);
  const [customersList, setCustomersList] = useState([])
  const [isVisible, setIsVisible] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formInfo, setFormInfo] = useState(null)
  const [customerName, setCustomerName] = useState('')

  const getEaters = async () => {
    setIsLoading(true)
    const partyGuest = await apiFetch("https://gp-js-test.herokuapp.com/pizza/guests");
    const eatingGuest = partyGuest.party.map(guest => guest.name.replace(' ', '%20'));
    const eatersBoolean = partyGuest.party.map(guest => guest.eatsPizza);
    
    const guestsDiets = await apiFetch(`https://gp-js-test.herokuapp.com/pizza/world-diets-book/${eatingGuest}`)

    const customers = guestsDiets.diet.map((guest,i) => {
      return {
        ...guest,
        eatsPizza: eatersBoolean[i],
        feedback: false
      }
    })

    localStorage.setItem('guests', JSON.stringify(partyGuest.party))

    setCustomersList(customers);
    setIsLoading(false);
    setIsVisible(true)
  }
  

  useEffect(() => {
    if(localStorage.getItem('guests')) {
      setCustomersList(JSON.parse(localStorage.getItem('guests')))
      setIsVisible(true)
    } else {
      getEaters()
    }
  }, [])


  const openForm = (name) => {
    setFormInfo(JSON.parse(localStorage.getItem(name)))
    setIsVisible(false)
    setIsFormVisible(true)
    setCustomerName(name)
  }

  const clearFunction = (name) => {
    localStorage.removeItem(name)
    setFormInfo(null)
  }

  const closeForm = (name) => {
    setIsVisible(true)
    setIsFormVisible(false)
    const changedGuest = customersList.find((customer) =>customer.name === name)
    const newGuests = [...customersList.filter((customer) =>customer.name !== name), {...changedGuest, feedback: true}]
    localStorage.setItem('guests',JSON.stringify(newGuests))

    setCustomersList(newGuests)
  }

  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", margin: "20px"}}>

      {isLoading && <div>Loading...</div>}

      {!isLoading && !!customersList.length && isVisible &&
      customersList.map(customer => 
      
      <table className='table' style={{borderCollapse: 'collapse'}} key ={customer.name}>

        <tbody>

        <tr>
        <td style={{border: "1px solid #000", width: "170px"}} >
        <button style={customer.eatsPizza ? {color: customer.isVegan ? 'green' : 'black'} : {color: "grey"}, {backgroundColor: "#fff", border: "none"}} disabled={!customer.eatsPizza} onClick = {() => openForm(customer.name)}>{customer.feedback ? "✔️" + customer.name : customer.name}</button>
        </td>
        </tr>
        
        </tbody>

      </table>
      )

     }
      <Form name = {customerName} formInfo = {formInfo} isFormVisible = {isFormVisible} closeForm = {closeForm} clearFunction = {clearFunction}/>
     <button onClick={getEaters}>Refresh</button>
    </div>
  );
}

export default App;
