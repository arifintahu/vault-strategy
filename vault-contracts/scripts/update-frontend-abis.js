const fs = require('fs');
const path = require('path');

/**
 * Update frontend ABIs from compiled artifacts
 */

const contracts = [
  'VaultBTC',
  'MockAave',
  'OracleEMA',
  'LeverageStrategy',
  'StrategyFactory'
];

const artifactsDir = path.join(__dirname, '../artifacts/contracts');
const frontendAbisDir = path.join(__dirname, '../../frontend/src/contracts/abis');

console.log('🔄 Updating frontend ABIs...\n');

// Ensure frontend abis directory exists
if (!fs.existsSync(frontendAbisDir)) {
  fs.mkdirSync(frontendAbisDir, { recursive: true });
  console.log('✅ Created frontend/src/contracts/abis directory\n');
}

contracts.forEach(contractName => {
  try {
    // Find the artifact file
    let artifactPath;
    
    if (contractName === 'VaultBTC') {
      artifactPath = path.join(artifactsDir, 'VaultBTC.sol', `${contractName}.json`);
    } else if (contractName === 'MockAave') {
      artifactPath = path.join(artifactsDir, 'MockAave.sol', `${contractName}.json`);
    } else if (contractName === 'OracleEMA') {
      artifactPath = path.join(artifactsDir, 'OracleEMA.sol', `${contractName}.json`);
    } else if (contractName === 'LeverageStrategy') {
      artifactPath = path.join(artifactsDir, 'LeverageStrategy.sol', `${contractName}.json`);
    } else if (contractName === 'StrategyFactory') {
      artifactPath = path.join(artifactsDir, 'StrategyFactory.sol', `${contractName}.json`);
    }
    
    if (!fs.existsSync(artifactPath)) {
      console.log(`⚠️  ${contractName}: Artifact not found at ${artifactPath}`);
      return;
    }
    
    // Read artifact
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
    // Write ABI to frontend
    const outputPath = path.join(frontendAbisDir, `${contractName}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(artifact.abi, null, 2));
    
    console.log(`✅ ${contractName}: ABI updated (${artifact.abi.length} functions/events)`);
    
  } catch (error) {
    console.error(`❌ ${contractName}: Error - ${error.message}`);
  }
});

console.log('\n🎉 Frontend ABIs updated successfully!');
console.log('\n💡 Next steps:');
console.log('   1. Restart frontend: cd frontend && npm run dev');
console.log('   2. Test the faucet in the UI');
