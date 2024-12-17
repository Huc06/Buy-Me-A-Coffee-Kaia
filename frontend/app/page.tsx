"use client";

import React, { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import abi from "../utils/BuyMeACoffee.json";
import { ethers } from "ethers";

interface Coffee {
  sender: string;
  name: string;
  timestamp: number;
  message: string;
}

export default function Home() {
  const [name, setName] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [coffee, setGetCoffee] = useState<Coffee[]>([]);
  const [coffeeContract, setCoffeeContract] = useState<ethers.Contract | null>(null);
  const contractAddress = "0xFE0eD87d5A9c960469DEbf019f8BADe5d64f56CC";
  const contractABI = abi.abi;
  const [coffeeValue, setCoffeeValue] = useState<string>("");

  const getCoffee = async () => {
    if (!coffeeContract) return;
    try {
      console.log("getting coffee Id");
      const coffeeId = await coffeeContract.coffeeId();
      console.log(coffeeId.toString());
      const getCoffee = await coffeeContract.getAllCoffee(coffeeId.toString());
      setGetCoffee(getCoffee);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const ethersProvider = new ethers.BrowserProvider(window.ethereum, 'any');
    const getCoffeeContract = async () => {
      const signer = await ethersProvider.getSigner();
      const buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer);
      setCoffeeContract(buyMeACoffee);
    };
    if (ethersProvider) {
      getCoffeeContract();
    }
  }, []);

  useEffect(() => {
    const onNewCoffee = (from: string, timestamp: number, name: string, message: string) => {
      console.log("Coffee received: ", from, timestamp, name, message);
      setGetCoffee((prevState) => [
        ...prevState,
        {
          sender: from,
          timestamp,
          message,
          name,
        },
      ]);
    };
    if (coffeeContract) {
      getCoffee();
      coffeeContract.on("NewCoffee", onNewCoffee);
    } else {
      console.log("provider not initialized yet");
    }
  }, [coffeeContract]);

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const onMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const onValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCoffeeValue(event.target.value);
  };

  const buyCoffee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!coffeeContract) {
      console.log("provider not initialized yet");
      return;
    }
    try {
      console.log("buying coffee..");
      const coffeeTxn = await coffeeContract.buyCoffee(name, message, { value: ethers.parseEther(coffeeValue) });
      const coffeTx = await coffeeTxn.wait();
      console.log("mined ", coffeTx.hash);
      console.log("coffee sent!");
      setName("");
      setMessage("");
      setCoffeeValue("");
      await getCoffee();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-r from-green-500 to-blue-500 p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Buy me a coffee</h1>
      <ConnectButton className="bg-white text-blue-500 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300 mb-6" />
      <form onSubmit={buyCoffee} className="flex flex-col w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <input 
          type="text" 
          name='inputName' 
          placeholder="Nhập tên của bạn" 
          className="p-4 rounded-md bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200" 
          onChange={onNameChange} 
        />
        <input 
          type="text" 
          name='inputAmount' 
          placeholder="Gửi tin nhắn của bạn" 
          className="p-4 rounded-md bg-gray-100 text-gray-800 border border-gray-300 mt-4 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200" 
          onChange={onMessageChange}
        />
        <input 
          type="text" 
          name='inputValue' 
          placeholder="Nhập số tiền gây quỹ (ETH)" 
          className="p-4 rounded-md bg-gray-100 text-gray-800 border border-gray-300 mt-4 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200" 
          onChange={onValueChange} 
        />
        <input 
          type="submit" 
          value="Send Coffee" 
          className="p-3 mt-6 rounded-2xl bg-green-500 text-white cursor-pointer hover:bg-green-600 transition duration-300"
        />
      </form>
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-white">Coffee Transaction</h2>
        <ul className="mt-4 bg-white rounded-lg shadow-lg p-4">
          {coffee.map((coffeeItem, index) => (
            <li key={index} className="border-b border-gray-300 py-2">
              <strong>{coffeeItem.name}</strong>: {coffeeItem.message} - <em>{new Date(coffeeItem.timestamp * 1000).toLocaleString()}</em>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
