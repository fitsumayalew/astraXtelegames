import coinImage from "@/assets/coin.png";

interface AnimatedCoinProps {
  size?: number;
  className?: string;
}

const AnimatedCoin = ({ size = 32, className = "" }: AnimatedCoinProps) => {
  return (
    <img
      src={coinImage}
      alt="Coin"
      className={className}
      style={{
        width: size,
        height: size,
      }}
    />
  );
};

export default AnimatedCoin;
