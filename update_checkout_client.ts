import * as fs from 'fs';

const filePath = 'src/app/checkout/CheckoutClient.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Update Props interface
const propReplacement = `  initialName: string;
  initialEmail: string;
  initialPhone: string;
  productImage?: string;
  existingPendingOrder?: { token: string, orderId: string, expiryTime: string, paymentMethodKey: string } | null;
}`;
content = content.replace(/initialName: string;\n  initialEmail: string;\n  initialPhone: string;\n\}/, propReplacement);

// Update component signature
const signatureReplacement = `  initialName,
  initialEmail,
  initialPhone,
  productImage,
  existingPendingOrder
}: CheckoutClientProps) {`;
content = content.replace(/initialName,\n  initialEmail,\n  initialPhone\n\}: CheckoutClientProps\) \{/, signatureReplacement);

// Update initialization of state
const stateReplacement = `const [paymentState, setPaymentState] = useState<"idle" | "verifying" | "success" | "pending" | "error">(existingPendingOrder ? "pending" : "idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodKey>((existingPendingOrder?.paymentMethodKey as PaymentMethodKey) || "QRIS");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [customerName, setCustomerName] = useState(initialName);
  const [customerEmail, setCustomerEmail] = useState(initialEmail);
  const [customerPhone, setCustomerPhone] = useState(initialPhone);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [currentToken, setCurrentToken] = useState(existingPendingOrder?.token || "");
  const [currentOrderId, setCurrentOrderId] = useState(existingPendingOrder?.orderId || "");
  const [expiryTime, setExpiryTime] = useState(existingPendingOrder?.expiryTime || "");`;

content = content.replace(/const \[paymentState, setPaymentState\][\s\S]*?const \[expiryTime, setExpiryTime\] = useState\(""\);/, stateReplacement);

// Update image rendering
const imageReplacement = `<div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                  {productImage ? (
                    <img src={productImage} alt={itemName} className="w-full h-full object-cover" />
                  ) : (
                    <CreditCard className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                  )}
                </div>`;
content = content.replace(/<div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center shrink-0">\s*<CreditCard className="w-6 h-6 text-gray-300 dark:text-gray-600" \/>\s*<\/div>/, imageReplacement);

fs.writeFileSync(filePath, content);
