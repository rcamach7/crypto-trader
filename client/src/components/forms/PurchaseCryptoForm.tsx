import { useState, SyntheticEvent, FC } from "react";
import { Button, TextField, Avatar, Alert, Typography } from "@mui/material/";
import { Crypto } from "../../data/global.models";
import { useGlobalContext } from "../../context/GlobalCryptoContext";
import {
  capitalizeFirstLetter,
  formatPrice,
  numberWithCommas,
} from "../../data/helpers";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { purchaseCrypto } from "../../data/api";
import { User, Error } from "../../data/global.models";

interface Props {
  crypto: Crypto;
  handleClose: () => void;
}

export const PurchaseCryptoForm: FC<Props> = ({ crypto, handleClose }) => {
  const { user, setUser, togglePageLoading, handleConfirmationMessage } =
    useGlobalContext();
  const [quantity, setQuantity] = useState<number>(0);
  const [error, setError] = useState<Error>({ exists: false });

  const handlePurchase = async (event: SyntheticEvent) => {
    event.preventDefault();
    togglePageLoading();
    if (quantity === 0) {
      setError({
        exists: true,
        message: "Please enter quantity greater than zero",
      });
      togglePageLoading();
    } else {
      try {
        const user: User = await purchaseCrypto(crypto.name, quantity);
        setUser(user);

        togglePageLoading();
        handleConfirmationMessage(
          `Purchased ${quantity} ${crypto.ticker.toUpperCase()} coin${
            quantity > 1 ? "s" : ""
          }`
        );
        handleClose();
      } catch (error) {
        setError({ exists: true, message: error.response.data.message });
        togglePageLoading();
      }
    }
  };

  return (
    <form
      className="PurchaseCryptoForm"
      onSubmit={handlePurchase}
      style={{ position: "relative" }}
    >
      <Typography
        id="modal-modal-title"
        variant="h6"
        component="h2"
        sx={{ textAlign: "center" }}
      >
        Purchase {capitalizeFirstLetter(crypto.name)}
      </Typography>
      <div className="priceOverview">
        <div className="cryptoDetails">
          <Avatar
            sx={{ border: "solid black 1px" }}
            aria-label="crypto"
            src={crypto.image}
          />
          <div className="buyPrice">
            <p className="buyPrice">Buy Price</p>
            <p>${numberWithCommas(formatPrice(crypto.price))}</p>
          </div>
        </div>
        <div className="balanceDetails">
          <Avatar
            sx={{ border: "solid black 1px", backgroundColor: "black" }}
            aria-label="balance"
          >
            <AccountBalanceWalletIcon />
          </Avatar>
          <div className="balance">
            <p className="balance">Balance</p>
            <p>
              ${user?.balance && numberWithCommas(formatPrice(user?.balance))}
            </p>
          </div>
        </div>
      </div>

      <div className="checkoutDetails">
        <TextField
          className="quantityInput"
          id="outlined-number"
          label="Enter Quantity"
          type="number"
          size="small"
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            inputProps: { min: 0 },
          }}
          value={isNaN(quantity) ? "" : quantity}
          onChange={(e) => setQuantity(Number.parseInt(e.target.value))}
          required
        />

        <p className="totalCalculation">
          Total: $
          {isNaN(quantity)
            ? 0
            : numberWithCommas(formatPrice(quantity * crypto.price))}
        </p>
      </div>
      <Button type="submit" className="purchaseBtn" variant="contained">
        Confirm Purchase
      </Button>
      <p style={{ fontSize: "10px", paddingTop: "2.5px" }}>
        transactions are made with real-time prices, above values are estimated
      </p>

      {/* Error feedback */}
      {error.exists && (
        <Alert severity="error" sx={{ marginTop: "10px", padding: "0 5px" }}>
          {error.message}
        </Alert>
      )}
    </form>
  );
};
