"use client";

import {Box, Stack, Typography, Button, Modal, TextField} from "@mui/material"
import {firestore} from "../firebase";
import {collection, getDocs, query, doc, setDoc, deleteDoc, getDoc} from "firebase/firestore";
import {useEffect, useState} from "react";


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 2
};


export default function Home() {
  const [pantry, setPantry] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [itemQuantity, setItemQuantity] = useState(1)


  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const [itemName, setItemName] = useState("")

  const addItem = async (item, quantity) => {
    const docRef = doc(collection(firestore, "pantry"), item.toLowerCase())
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      await setDoc(docRef, { quantity: docSnap.data().quantity + quantity })
    } else {
      await setDoc(docRef, { quantity: quantity })
    }
    updatePantry()
  }


  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'))
    const docs = await getDocs(snapshot)
    const pantryList = {}
    docs.forEach((doc) => {
      pantryList[doc.id] = doc.data().quantity
    })
    setPantry(pantryList)
  }

  const removeItem = async (item) => {
    const docRef = doc(firestore, "pantry", item.toLowerCase())
    const docSnap = await getDoc(docRef)
    if (docSnap.exists() && docSnap.data().quantity > 1) {
      await setDoc(docRef, { quantity: docSnap.data().quantity - 1 })
    } else {
      await deleteDoc(docRef)
    }
    updatePantry()
  }
  const filteredPantry = Object.entries(pantry).filter(([item]) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  )


  useEffect(() => {
    updatePantry();
  }, []);
  console.log(pantry)
  return (
    <Box
    width = "100vw"
    height = "100vh"
    display = {"flex"}
    flexDirection = {"column"}
    justifyContent = {"center"}
    alignItems = {"center"}
    gap = {2}
    >
      <Box width = "800px" height = "100px" bgcolor = {"#FFFFFF"} display = {"flex"} justifyContent = {"center"} alignItems = {"center"}>
        <Typography variant = "h1" fontWeight = {"bold"} textAlign = {"center"} color = {"blue"} fontSize = {"3rem"}>
          Pantry Item Tracker
        </Typography>
      </Box>
      <Button variant="contained" margin="20px" onClick={handleOpen}>Add Item</Button>
      <TextField
        label="Search items"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        margin="normal"
        variant="outlined"
        style={{ width: "800px" }}
      />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack>
            <TextField
              label="Item Name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              margin="normal"
            />
            <TextField
              label="Quantity"
              type="number"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              margin="normal"
              inputProps={{ min: 1 }}
            />
            <Button 
              variant="contained" 
              onClick={() => {
                addItem(itemName, itemQuantity);
                setItemName("");
                setItemQuantity(1);
                handleClose();
              }}
            >
              Add Item
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Stack width="800px" height="600px" spacing={2} overflow={"auto"} display={"block"} border={"1px solid #333"} margin={"20px"}>
        {filteredPantry.map(([item, quantity]) => (
          <Box key={item} width="100%" height="150px" display={"flex"} justifyContent={"space-between"} alignItems={"center"} bgcolor={"#f0f0f0"} padding={"30px"}>
            <Typography variant="h3" fontWeight={"bold"} textAlign={"center"} color={"#333"}>
              {item.charAt(0).toUpperCase() + item.slice(1)} (Quantity: {quantity})
            </Typography>
            <Button variant="outlined" margin="3px" onClick={() => {removeItem(item)}}>Remove Item</Button>
          </Box>
        ))}
    </Stack>
    </Box>
  );
}
