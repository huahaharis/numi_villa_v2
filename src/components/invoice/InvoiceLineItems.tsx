"use client";

import React, { useState, useCallback } from "react";
import { Trash2, Plus } from "lucide-react";

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  badge?: string;
}

export interface AvailableService {
  id: string;
  description: string;
  unitPrice: number;
  badge?: string;
}

interface InvoiceLineItemsProps {
  items: LineItem[];
  availableServices?: AvailableService[];
  currency?: string;
  onChange?: (items: LineItem[]) => void;
  readOnly?: boolean;
}

const defaultServices: AvailableService[] = [
  {
    id: "accommodation",
    description: "Accommodation: Villa Stay",
    unitPrice: 12500000,
    badge: "High Season",
  },
  {
    id: "floating-breakfast",
    description: "Premium Floating Breakfast",
    unitPrice: 750000,
  },
  {
    id: "airport-transfer",
    description: "Airport Transfer (Inbound + Outbound)",
    unitPrice: 450000,
  },
  {
    id: "private-chef",
    description: "Private Chef Dinner - 5-course meal",
    unitPrice: 1500000,
  },
  {
    id: "spa-treatment",
    description: "In-Villa Spa Treatment",
    unitPrice: 1200000,
  },
  {
    id: "yoga-session",
    description: "Private Yoga Session",
    unitPrice: 500000,
  },
];

export function InvoiceLineItems({
  items,
  availableServices = defaultServices,
  currency = "IDR",
  onChange,
  readOnly = false,
}: InvoiceLineItemsProps) {
  const [showServiceSelector, setShowServiceSelector] = useState(false);

  const formatAmount = (amount: number) => {
    return `${currency} ${amount.toLocaleString("en-US")}`;
  };

  const calculateTotal = (qty: number, price: number) => qty * price;

  const updateItem = useCallback(
    (id: string, field: keyof LineItem, value: string | number) => {
      if (!onChange || readOnly) return;

      const updatedItems = items.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          updated.total = calculateTotal(
            field === "quantity" ? Number(value) : item.quantity,
            field === "unitPrice" ? Number(value) : item.unitPrice
          );
        }
        return updated;
      });

      onChange(updatedItems);
    },
    [items, onChange, readOnly]
  );

  const deleteItem = useCallback(
    (id: string) => {
      if (!onChange || readOnly) return;
      onChange(items.filter((item) => item.id !== id));
    },
    [items, onChange, readOnly]
  );

  const addService = useCallback(
    (service: AvailableService) => {
      if (!onChange || readOnly) return;

      const newItem: LineItem = {
        id: `item-${Date.now()}`,
        description: service.description,
        quantity: 1,
        unitPrice: service.unitPrice,
        total: service.unitPrice,
        badge: service.badge,
      };

      onChange([...items, newItem]);
      setShowServiceSelector(false);
    },
    [items, onChange, readOnly]
  );

  const addCustomRow = useCallback(() => {
    if (!onChange || readOnly) return;

    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: "New Service",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };

    onChange([...items, newItem]);
  }, [items, onChange, readOnly]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-(--foreground)">
          Services &amp; Extras
        </h3>
        {!readOnly && (
          <div className="flex items-center gap-2">
            {showServiceSelector ? (
              <div className="relative">
                <select
                  onChange={(e) => {
                    const service = availableServices.find(
                      (s) => s.id === e.target.value
                    );
                    if (service) addService(service);
                  }}
                  className="appearance-none bg-white border border-(--border) text-(--foreground) text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-(--accent)"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select a service...
                  </option>
                  {availableServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.description} - {formatAmount(service.unitPrice)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowServiceSelector(false)}
                  className="ml-2 text-sm text-(--text-muted) hover:text-(--foreground)"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowServiceSelector(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-(--foreground) bg-white border border-(--border) rounded-lg hover:bg-(--background) transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Service
                </button>
                <button
                  onClick={addCustomRow}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-(--foreground) bg-white border border-(--border) rounded-lg hover:bg-(--background) transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Custom Row
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border border-(--border) rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-(--background) border-b border-(--border)">
              <th className="text-left px-4 py-3 text-xs font-semibold text-(--text-muted) uppercase tracking-wider w-[45%]">
                Description
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-(--text-muted) uppercase tracking-wider w-[10%]">
                Qty
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-(--text-muted) uppercase tracking-wider w-[20%]">
                Unit Price
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-(--text-muted) uppercase tracking-wider w-[20%]">
                Total
              </th>
              {!readOnly && (
                <th className="text-center px-4 py-3 text-xs font-semibold text-(--text-muted) uppercase tracking-wider w-[5%]">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border)">
            {items.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-(--background) transition-colors"
              >
                {/* Description */}
                <td className="px-4 py-3">
                  {readOnly ? (
                    <div>
                      <span className="text-sm text-(--foreground)">
                        {item.description}
                      </span>
                      {item.badge && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-(--accent)/10 text-(--accent)">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(item.id, "description", e.target.value)
                        }
                        className="w-full text-sm bg-transparent border border-transparent focus:border-(--border) rounded px-2 py-1 text-(--foreground) focus:outline-none focus:ring-1 focus:ring-(--accent)"
                      />
                      {item.badge && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-(--accent)/10 text-(--accent) whitespace-nowrap">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </td>

                {/* Quantity */}
                <td className="px-4 py-3 text-center">
                  {readOnly ? (
                    <span className="text-sm text-(--foreground)">
                      {item.quantity}
                    </span>
                  ) : (
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "quantity",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="w-16 text-center text-sm bg-transparent border border-transparent focus:border-(--border) rounded px-2 py-1 text-(--foreground) focus:outline-none focus:ring-1 focus:ring-(--accent)"
                    />
                  )}
                </td>

                {/* Unit Price */}
                <td className="px-4 py-3 text-right">
                  {readOnly ? (
                    <span className="text-sm text-(--foreground)">
                      {formatAmount(item.unitPrice)}
                    </span>
                  ) : (
                    <input
                      type="number"
                      min={0}
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "unitPrice",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-28 text-right text-sm bg-transparent border border-transparent focus:border-(--border) rounded px-2 py-1 text-(--foreground) focus:outline-none focus:ring-1 focus:ring-(--accent)"
                    />
                  )}
                </td>

                {/* Total */}
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-medium text-(--foreground)">
                    {formatAmount(item.total)}
                  </span>
                </td>

                {/* Actions */}
                {!readOnly && (
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1.5 text-(--text-muted) hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td
                  colSpan={readOnly ? 4 : 5}
                  className="px-4 py-8 text-center text-sm text-(--text-muted)"
                >
                  No items added. Click &quot;Add Service&quot; or &quot;Custom
                  Row&quot; to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
