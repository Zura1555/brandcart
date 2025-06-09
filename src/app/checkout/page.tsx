import type { NextPage } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const CheckoutPage: NextPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="items-center text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <CardTitle className="text-3xl font-headline text-foreground">Thank You!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg font-body text-muted-foreground mb-6">
            Your order has been successfully processed.
          </p>
          <p className="text-sm font-body text-muted-foreground">
            (This is a placeholder page. No actual order was placed.)
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild className="font-headline bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Minimal Card components for this page as it's simple.
// If more complex, import from @/components/ui/card
const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={`rounded-xl border bg-card text-card-foreground shadow-lg ${className}`} {...props} />
);
const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
);
const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props} />
);
const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props} />
);
const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={`flex items-center p-6 pt-0 ${className}`} {...props} />
);


export default CheckoutPage;
