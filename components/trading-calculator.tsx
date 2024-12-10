"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

const TradingCalculator = () => {
  const [inputs, setInputs] = useState({
    marginBalance: 382,
    availableBalance: 333.2911,
    quantity: 0.005,
    entryPrice: 97385.88,
    currentPrice: 97794.8,
    leverage: 10,
    maintenanceMargin: 2.68,
  });

  const handleInputChange = (name: string, value: string | number) => {
    setInputs((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const calculateMetrics = () => {
    const positionValue = inputs.quantity * inputs.currentPrice;
    const initialMargin = positionValue / inputs.leverage;
    const marginUsageRatio = (initialMargin / inputs.marginBalance) * 100;
    const unrealizedPnL =
      inputs.quantity * (inputs.currentPrice - inputs.entryPrice);

    // Calculate maximum safe position size (30% margin limit)
    const maxMarginUsage = inputs.marginBalance * 0.3;
    const maxPositionValue = maxMarginUsage * inputs.leverage;
    const maxQuantity = maxPositionValue / inputs.currentPrice;

    // Calculate remaining safe position size
    const remainingMargin = maxMarginUsage - initialMargin;
    const remainingPositionValue = remainingMargin * inputs.leverage;
    const remainingQuantity = remainingPositionValue / inputs.currentPrice;

    // ROE calculation
    const roe = (unrealizedPnL / initialMargin) * 100;

    return {
      positionValue: positionValue.toFixed(2),
      initialMargin: initialMargin.toFixed(2),
      marginUsageRatio: marginUsageRatio.toFixed(2),
      unrealizedPnL: unrealizedPnL.toFixed(2),
      maxQuantity: maxQuantity.toFixed(6),
      remainingQuantity: remainingQuantity.toFixed(6),
      roe: roe.toFixed(2),
      isMarginSafe: marginUsageRatio <= 30,
    };
  };

  const generateChartData = () => {
    return [-10, -5, -2.5, 0, 2.5, 5, 10].map((percent) => {
      const price = inputs.currentPrice * (1 + percent / 100);
      const positionValue = inputs.quantity * price;
      const margin = positionValue / inputs.leverage;
      const marginRatio = (margin / inputs.marginBalance) * 100;
      const pnl = inputs.quantity * (price - inputs.entryPrice);
      const roe = (pnl / (positionValue / inputs.leverage)) * 100;

      return {
        priceChange: `${percent}%`,
        price: price.toFixed(0),
        marginRatio: Number(marginRatio.toFixed(2)),
        roe: Number(roe.toFixed(2)),
      };
    });
  };

  const metrics = calculateMetrics();
  const chartData = generateChartData();

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Position Risk Calculator</h2>

          {!metrics.isMarginSafe && (
            <Alert className="bg-red-50">
              <AlertDescription>
                Warning: Current margin usage ({metrics.marginUsageRatio}%)
                exceeds safe limit of 30%
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Margin Balance
              </label>
              <Input
                type="number"
                value={inputs.marginBalance}
                onChange={(e) =>
                  handleInputChange("marginBalance", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Available Balance
              </label>
              <Input
                type="number"
                value={inputs.availableBalance}
                onChange={(e) =>
                  handleInputChange("availableBalance", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Position Size (BTC)
              </label>
              <Input
                type="number"
                value={inputs.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                step="0.000001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Entry Price
              </label>
              <Input
                type="number"
                value={inputs.entryPrice}
                onChange={(e) =>
                  handleInputChange("entryPrice", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Current Price
              </label>
              <Input
                type="number"
                value={inputs.currentPrice}
                onChange={(e) =>
                  handleInputChange("currentPrice", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Leverage</label>
              <Input
                type="number"
                value={inputs.leverage}
                onChange={(e) => handleInputChange("leverage", e.target.value)}
                min="1"
                max="125"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-medium">Position Value</td>
                  <td className="p-2">${metrics.positionValue}</td>
                  <td className="p-2 font-medium">Initial Margin</td>
                  <td className="p-2">${metrics.initialMargin}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Current Margin Usage</td>
                  <td
                    className={`p-2 ${Number(metrics.marginUsageRatio) > 30 ? "text-red-600" : "text-green-600"}`}
                  >
                    {metrics.marginUsageRatio}%
                  </td>
                  <td className="p-2 font-medium">ROE</td>
                  <td
                    className={`p-2 ${Number(metrics.roe) >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {metrics.roe}%
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Max Safe Position</td>
                  <td className="p-2">{metrics.maxQuantity} BTC</td>
                  <td className="p-2 font-medium">Remaining Safe Position</td>
                  <td className="p-2">{metrics.remainingQuantity} BTC</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Unrealized P/L</td>
                  <td
                    className={`p-2 ${Number(metrics.unrealizedPnL) >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    ${metrics.unrealizedPnL}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="h-64">
            <LineChart
              width={600}
              height={200}
              data={chartData}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priceChange" />
              <YAxis />
              <Tooltip />
              <Legend />
              <ReferenceLine
                y={30}
                stroke="red"
                strokeDasharray="3 3"
                label="Safe Margin Limit"
              />
              <Line
                type="monotone"
                dataKey="marginRatio"
                stroke="#82ca9d"
                name="Margin Usage %"
              />
              <Line
                type="monotone"
                dataKey="roe"
                stroke="#8884d8"
                name="ROE %"
              />
            </LineChart>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TradingCalculator;
