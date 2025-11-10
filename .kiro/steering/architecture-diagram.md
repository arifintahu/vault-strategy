---
inclusion: always
---

# Architecture Diagram

## System Flow

```mermaid
flowchart TB
    subgraph Users
        U1[User 1]
        U2[User 2]
        U3[User 3]
    end
    
    subgraph Factory
        F[StrategyFactory]
    end
    
    subgraph Vaults
        V1[LeverageStrategy 1<br/>Owner: User 1<br/>Risk: Low]
        V2[LeverageStrategy 2<br/>Owner: User 2<br/>Risk: Medium]
        V3[LeverageStrategy 3<br/>Owner: User 3<br/>Risk: High]
    end
    
    subgraph Core
        VB[VaultBTC Token]
        O[OracleBands<br/>Price & MA Bands]
    end
    
    subgraph Keepers
        K[Automated Keeper<br/>Rebalance Trigger]
    end
    
    subgraph Future
        A[Adapter Module]
        L[Lending Platform<br/>Aave/Spark]
        D[DEX<br/>Uniswap/Curve]
    end
    
    U1 -->|createVault| F
    U2 -->|createVault| F
    U3 -->|createVault| F
    
    F -->|deploy| V1
    F -->|deploy| V2
    F -->|deploy| V3
    
    U1 -->|deposit/withdraw| V1
    U2 -->|deposit/withdraw| V2
    U3 -->|deposit/withdraw| V3
    
    VB -.->|collateral| V1
    VB -.->|collateral| V2
    VB -.->|collateral| V3
    
    O -.->|price data| V1
    O -.->|price data| V2
    O -.->|price data| V3
    
    K -->|rebalance| V1
    K -->|rebalance| V2
    K -->|rebalance| V3
    
    V1 -.->|intent| A
    V2 -.->|intent| A
    V3 -.->|intent| A
    
    A -.->|supply/borrow| L
    A -.->|swap| D
    
    style V1 fill:#e1f5ff
    style V2 fill:#fff4e1
    style V3 fill:#ffe1e1
    style F fill:#d4edda
    style K fill:#f8d7da
```

## Leverage Loop (Production)

```mermaid
sequenceDiagram
    participant User
    participant Vault as LeverageStrategy
    participant Oracle as OracleBands
    participant Keeper
    participant Adapter
    participant Lending as Aave/Spark
    participant DEX as Uniswap
    
    User->>Vault: deposit(vaultBTC)
    Note over Vault: collateral += amount<br/>leverage = 1.0x
    
    loop Automated Rebalancing
        Keeper->>Oracle: get()
        Oracle-->>Keeper: price, MA, bands
        
        alt Price Dips Below Lower Band
            Keeper->>Vault: rebalance()
            Note over Vault: targetLeverage += step
            Vault->>Adapter: executeIncrease(targetBps)
            
            loop Until Target Reached
                Adapter->>Lending: supply(vaultBTC)
                Adapter->>Lending: borrow(stablecoin)
                Adapter->>DEX: swap(stablecoin → vaultBTC)
            end
            
            Adapter-->>Vault: execution report
            Vault-->>Keeper: Rebalance event
        
        else Price Rallies Above Upper Band
            Keeper->>Vault: rebalance()
            Note over Vault: targetLeverage -= step
            Vault->>Adapter: executeDecrease(targetBps)
            
            loop Until Target Reached
                Adapter->>Lending: withdraw(vaultBTC)
                Adapter->>DEX: swap(vaultBTC → stablecoin)
                Adapter->>Lending: repay(stablecoin)
            end
            
            Adapter-->>Vault: execution report
            Vault-->>Keeper: Rebalance event
        end
    end
    
    User->>Vault: withdraw(amount)
    Note over Vault: collateral -= amount
    Vault-->>User: transfer vaultBTC
```

## Bitcoin Trustless Vault Integration

```mermaid
flowchart LR
    subgraph Bitcoin Layer
        BTC[Bitcoin Network]
        TV[Trustless Vault<br/>BitVM3]
    end
    
    subgraph App Chain
        VB[vaultBTC Token<br/>ERC20]
        F[StrategyFactory]
        V[LeverageStrategy<br/>Vaults]
        O[Oracle]
    end
    
    subgraph DeFi Protocols
        L[Lending<br/>Aave/Spark]
        D[DEX<br/>Uniswap]
    end
    
    BTC -->|lock| TV
    TV -->|mint| VB
    VB -->|redeem| TV
    TV -->|unlock| BTC
    
    VB -->|deposit| V
    F -->|create| V
    O -->|price| V
    
    V -->|supply| L
    V -->|swap| D
    
    style TV fill:#f9a825
    style BTC fill:#ff9800
    style VB fill:#4caf50
    style V fill:#2196f3
```

## Key Concepts

### Factory Pattern
- Users call `StrategyFactory.createVault(riskTier)` to deploy their own isolated vault
- Each vault is owned by the creator
- Factory maintains registry for discovery

### Access Control
- **Owner-only**: deposit, withdraw, setRisk
- **Public**: rebalance (automated by keepers)

### Intent-Based Execution
- Strategy sets target leverage (intent)
- Adapter executes on lending/DEX (execution)
- Separation allows upgradeable execution logic

### Self-Custody
- Users maintain full control over their vaultBTC
- Only owner can withdraw funds
- System can only optimize leverage, not extract funds
