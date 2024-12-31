/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";

const OrderTable = ({ onChat, onLogout }) => {
  const [orders, setOrders] = useState([]);
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${baseURL}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, [baseURL]);

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl">My Orders</h2>
        <button
          onClick={onLogout}
          className="bg-red-500 text-white py-1 px-3 rounded"
        >
          Logout
        </button>
      </div>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4">Description</th>
            <th className="py-2 px-4">Specifications</th>
            <th className="py-2 px-4">Quantity</th>
            <th className="py-2 px-4">Status</th>
            <th className="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t">
              <td className="py-2 px-4">{order.description}</td>
              <td className="py-2 px-4">{order.specifications}</td>
              <td className="py-2 px-4">{order.quantity}</td>
              <td className="py-2 px-4">{order.status}</td>
              <td className="py-2 px-4">
                <button
                  onClick={() => onChat(order.chatRoomId)}
                  className="bg-green-500 text-white py-1 px-3 rounded"
                >
                  Ask Support {order.chatRoomId}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
