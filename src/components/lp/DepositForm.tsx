"use client";

import { useState, useCallback } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { erc20Abi, parseUnits, formatUnits } from "viem";
import {
  USDC_ADDRESS,
  SUPPORTED_PLATFORMS,
  SUPPORTED_CURRENCIES,
  formatRate,
} from "@/lib/wagmi";

type Platform = (typeof SUPPORTED_PLATFORMS)[number];
type DepositFormProps = {
  onSuccess: (txHash: string) => void;
};

export default function DepositForm({ onSuccess }: DepositFormProps) {
  const { address } = useAccount();

  // Form state
  const [amount, setAmount] = useState("");
  const [minIntent, setMinIntent] = useState("10");
  const [maxIntent, setMaxIntent] = useState("500");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(["USD"]);
  const [rate, setRate] = useState("1.00");
  const [payeeDetails, setPayeeDetails] = useState<Record<string, Record<string, string>>>({});
  const [step, setStep] = useState<"config" | "approve" | "deposit" | "processing">("config");

  // Read USDC balance
  const { data: balance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // Read USDC allowance (using a placeholder escrow — will be replaced with real address)
  const ESCROW_V2 = "0x4340A9f9D20C3f26437fde79ee7c8A24e3e13934" as const;
  const { data: allowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, ESCROW_V2] : undefined,
  });

  // Approve USDC
  const { writeContract: approve, data: approveHash } = useWriteContract();
  const { isLoading: isApproving, isSuccess: approveConfirmed } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const formattedBalance = balance ? formatUnits(balance, 6) : "0";
  const depositAmount = amount ? parseUnits(amount, 6) : 0n;
  const needsApproval = allowance !== undefined && depositAmount > 0n && allowance < depositAmount;

  const togglePlatform = useCallback((platform: Platform) => {
    setSelectedPlatforms((prev) => {
      const exists = prev.find((p) => p.id === platform.id);
      if (exists) return prev.filter((p) => p.id !== platform.id);
      return [...prev, platform];
    });
  }, []);

  const toggleCurrency = useCallback((currency: string) => {
    setSelectedCurrencies((prev) =>
      prev.includes(currency)
        ? prev.filter((c) => c !== currency)
        : [...prev, currency]
    );
  }, []);

  const updatePayeeDetail = useCallback(
    (platformId: string, field: string, value: string) => {
      setPayeeDetails((prev) => ({
        ...prev,
        [platformId]: { ...prev[platformId], [field]: value },
      }));
    },
    []
  );

  const handleApprove = useCallback(() => {
    if (!depositAmount) return;
    setStep("approve");
    approve({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "approve",
      args: [ESCROW_V2, depositAmount],
    });
  }, [approve, depositAmount]);

  const handleDeposit = useCallback(async () => {
    setStep("processing");
    // In production, this would call Zkp2pClient.createDeposit()
    // For now, we show the prepared transaction details
    // The SDK call would be:
    //
    // const client = new Zkp2pClient({ walletClient, chainId: 8453 });
    // const { hash } = await client.createDeposit({
    //   token: USDC_ADDRESS,
    //   amount: depositAmount,
    //   intentAmountRange: { min: parseUnits(minIntent, 6), max: parseUnits(maxIntent, 6) },
    //   processorNames: selectedPlatforms.map(p => p.id),
    //   depositData: selectedPlatforms.map(p => payeeDetails[p.id] || {}),
    //   conversionRates: selectedPlatforms.map(() =>
    //     selectedCurrencies.map(c => ({ currency: c, conversionRate: formatRate(parseFloat(rate)) }))
    //   ),
    // });

    // Simulate for demo
    await new Promise((r) => setTimeout(r, 2000));
    onSuccess("0x" + "a".repeat(64));
  }, [depositAmount, minIntent, maxIntent, selectedPlatforms, selectedCurrencies, rate, payeeDetails, onSuccess]);

  const isValid =
    amount &&
    parseFloat(amount) > 0 &&
    selectedPlatforms.length > 0 &&
    selectedCurrencies.length > 0 &&
    parseFloat(rate) > 0 &&
    selectedPlatforms.every((p) =>
      p.fields.every((f) => payeeDetails[p.id]?.[f])
    );

  return (
    <div className="space-y-8">
      {/* Balance display */}
      <div className="frost p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">
            Your USDC Balance
          </p>
          <p className="text-2xl font-bold font-mono">
            {parseFloat(formattedBalance).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            <span className="text-sm text-[var(--muted)] ml-2">USDC</span>
          </p>
        </div>
        <div className="badge-live">Base</div>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium mb-2">Deposit Amount</label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-lg font-mono focus:border-[var(--accent)] focus:outline-none transition-colors placeholder:text-[var(--muted)]/50"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">
            USDC
          </span>
        </div>
        {amount && parseFloat(amount) > parseFloat(formattedBalance) ? (
          <p className="text-xs text-red-400 mt-1">Insufficient balance</p>
        ) : null}
      </div>

      {/* Intent range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1.5">
            Min per trade
          </label>
          <div className="relative">
            <input
              type="number"
              value={minIntent}
              onChange={(e) => setMinIntent(e.target.value)}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm font-mono focus:border-[var(--accent)] focus:outline-none transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--muted)]">
              USDC
            </span>
          </div>
        </div>
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1.5">
            Max per trade
          </label>
          <div className="relative">
            <input
              type="number"
              value={maxIntent}
              onChange={(e) => setMaxIntent(e.target.value)}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm font-mono focus:border-[var(--accent)] focus:outline-none transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--muted)]">
              USDC
            </span>
          </div>
        </div>
      </div>

      {/* Payment platforms */}
      <div>
        <label className="block text-sm font-medium mb-3">
          Payment Platforms
        </label>
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_PLATFORMS.map((p) => {
            const selected = selectedPlatforms.some((sp) => sp.id === p.id);
            return (
              <button
                key={p.id}
                onClick={() => togglePlatform(p)}
                className={`px-3.5 py-2 rounded-lg text-sm transition-all ${
                  selected
                    ? "bg-[var(--accent)]/[0.12] border-[var(--accent)]/30 text-[var(--accent)] border"
                    : "bg-white/[0.02] border border-[var(--border)] text-[var(--secondary)] hover:border-white/[0.1]"
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Payee details per platform */}
      {selectedPlatforms.length > 0 ? (
        <div className="space-y-4">
          <label className="block text-sm font-medium">
            Your Payment Details
          </label>
          {selectedPlatforms.map((platform) => (
            <div key={platform.id} className="frost p-4">
              <p className="text-xs text-[var(--accent)] font-mono uppercase tracking-wider mb-3">
                {platform.name}
              </p>
              {platform.fields.map((field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={field === "venmoHandle" ? "@username" : field === "cashtag" ? "$cashtag" : "email@example.com"}
                  value={payeeDetails[platform.id]?.[field] || ""}
                  onChange={(e) => updatePayeeDetail(platform.id, field, e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none transition-colors placeholder:text-[var(--muted)]/40"
                />
              ))}
            </div>
          ))}
        </div>
      ) : null}

      {/* Currencies */}
      <div>
        <label className="block text-sm font-medium mb-3">
          Accepted Currencies
        </label>
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_CURRENCIES.map((c) => {
            const selected = selectedCurrencies.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggleCurrency(c)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                  selected
                    ? "bg-[var(--green)]/[0.12] border-[var(--green)]/30 text-[var(--green)] border"
                    : "bg-white/[0.02] border border-[var(--border)] text-[var(--muted)] hover:border-white/[0.1]"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rate */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Conversion Rate (spread)
        </label>
        <p className="text-xs text-[var(--muted)] mb-2">
          1.00 = no spread. 1.02 = 2% spread (you earn 2% on every trade).
        </p>
        <input
          type="number"
          step="0.01"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-lg font-mono focus:border-[var(--accent)] focus:outline-none transition-colors"
        />
      </div>

      {/* Summary */}
      {isValid ? (
        <div className="frost p-5 space-y-3">
          <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2">
            Summary
          </p>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--secondary)]">Deposit</span>
            <span className="font-mono">{amount} USDC</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--secondary)]">Platforms</span>
            <span className="font-mono">
              {selectedPlatforms.map((p) => p.name).join(", ")}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--secondary)]">Currencies</span>
            <span className="font-mono">
              {selectedCurrencies.join(", ")}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--secondary)]">Spread</span>
            <span className="font-mono text-[var(--green)]">
              {((parseFloat(rate) - 1) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--secondary)]">Range</span>
            <span className="font-mono">
              {minIntent} — {maxIntent} USDC
            </span>
          </div>
        </div>
      ) : null}

      {/* Actions */}
      <div className="space-y-3">
        {needsApproval && !approveConfirmed ? (
          <button
            onClick={handleApprove}
            disabled={isApproving || !isValid}
            className="w-full py-3.5 rounded-lg bg-[var(--amber)]/10 border border-[var(--amber)]/20 text-[var(--amber)] font-medium text-sm transition-colors hover:bg-[var(--amber)]/15 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isApproving ? "Approving USDC..." : `Approve ${amount} USDC`}
          </button>
        ) : null}

        <button
          onClick={handleDeposit}
          disabled={!isValid || (needsApproval && !approveConfirmed) || step === "processing"}
          className="w-full py-3.5 rounded-lg bg-[var(--accent)] hover:bg-[#2563eb] text-white font-medium text-sm transition-colors glow-box disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {step === "processing"
            ? "Creating deposit..."
            : "Create Deposit & Start Earning"}
        </button>
      </div>
    </div>
  );
}
