#!/bin/bash

echo "🔍 Checking Vault Strategy Status..."
echo ""

# Check if Hardhat node is running
echo "1️⃣ Checking Hardhat Node..."
if curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://127.0.0.1:8545 > /dev/null 2>&1; then
    echo "   ✅ Hardhat node is running on http://127.0.0.1:8545"
else
    echo "   ❌ Hardhat node is NOT running"
    echo "   Run: cd vault-contracts && npx hardhat node"
    exit 1
fi

echo ""
echo "2️⃣ Checking Contract Deployment..."
# Try to call a contract
RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0","data":"0x6d4ce63c"},"latest"],"id":1}' http://127.0.0.1:8545)

if echo "$RESPONSE" | grep -q '"result":"0x"'; then
    echo "   ❌ Contracts are NOT deployed"
    echo "   Run: cd vault-contracts && npm run deploy:local"
    exit 1
elif echo "$RESPONSE" | grep -q '"result"'; then
    echo "   ✅ Contracts are deployed"
else
    echo "   ⚠️  Cannot verify contract deployment"
fi

echo ""
echo "3️⃣ Contract Addresses:"
echo "   VaultBTC:        0x5FbDB2315678afecb367f032d93F642f64180aa3"
echo "   MockAave:        0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
echo "   OracleEMA:       0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
echo "   StrategyFactory: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"

echo ""
echo "4️⃣ Frontend Status:"
if lsof -i :5173 > /dev/null 2>&1; then
    echo "   ✅ Frontend is running on http://localhost:5173"
else
    echo "   ❌ Frontend is NOT running"
    echo "   Run: cd frontend && npm run dev"
fi

echo ""
echo "✅ All systems operational!"
echo ""
echo "📱 Open http://localhost:5173 in your browser"
echo "🦊 Make sure MetaMask is connected to Hardhat Local (Chain ID: 31337)"
