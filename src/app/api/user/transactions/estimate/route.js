import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { web3Service } from "@/utils/web3";

export async function POST(request) {
  try {
    const { fromAddress, toAddress, amount, networkId } = await request.json();
    console.log("Gas estimation request:", { fromAddress, toAddress, amount, networkId });

    // Validate required fields
    if (!fromAddress || !toAddress || !amount || !networkId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get provider
    const provider = await web3Service.getProvider(networkId);
    if (!provider) {
      return NextResponse.json(
        { error: "Failed to connect to network" },
        { status: 500 }
      );
    }

    // Create complete transaction object according to eth_call spec
    const tx = {
      from: fromAddress,           // 20 bytes - sender address
      to: toAddress,               // 20 bytes - recipient address
      value: ethers.parseEther(amount.toString()), // value in wei
      data: "0x",                  // default empty data for ETH transfer
      gas: "0x0",                  // let provider estimate
      gasPrice: "0x0"             // let provider determine current gas price
    };
    console.log("Transaction object:", {
      ...tx,
      value: tx.value.toString(), // Convert BigInt to string for logging
    });

    try {
      // Get gas estimate
      const gasEstimate = await provider.estimateGas(tx);
      const feeData = await provider.getFeeData();
      
      // Calculate total gas cost in ETH
      const gasCost = gasEstimate * feeData.gasPrice;
      const gasEstimateInEth = ethers.formatEther(gasCost);

      const responseData = {
        gasEstimate: gasEstimateInEth,
        gasLimit: gasEstimate.toString(),
        gasPrice: feeData.gasPrice.toString(),
        message: "Gas estimated successfully"
      };
      console.log("Gas estimation response:", responseData);

      return NextResponse.json(responseData);
    } catch (error) {
      console.error("Gas estimation error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to estimate gas" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
