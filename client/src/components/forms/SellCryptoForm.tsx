import {
  Avatar,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { useUserContext } from "../../hooks/useUserContext";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { capitalizeFirstLetter, formatPrice } from "../../assets/helpers";
import { Crypto } from "../../data/models";

interface Props {
  crypto: Crypto;
  handleClose: () => void;
  walletQuantity: number;
}

export const SellCryptoForm: React.FC<Props> = ({
  crypto,
  handleClose,
  walletQuantity,
}) => {
  const { user, setUser } = useUserContext();
  const [checked, setChecked] = React.useState<boolean>(false);
  const [quantity, setQuantity] = React.useState<number>(0);

  const handleSell = (event: React.SyntheticEvent) => {
    event.preventDefault();
  };

  const handleChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  React.useEffect(() => {
    if (checked) {
      setQuantity(walletQuantity);
    } else {
      setQuantity(0);
    }
  }, [checked, walletQuantity]);

  return (
    <form onSubmit={handleSell} className="SellCryptoForm">
      <Typography
        id="modal-modal-title"
        variant="h6"
        component="h2"
        sx={{ textAlign: "center" }}
      >
        Sell {capitalizeFirstLetter(crypto.name)}
      </Typography>

      <div className="priceOverview">
        <div className="cryptoDetails">
          <Avatar
            sx={{ border: "solid black 1px" }}
            aria-label="crypto"
            src={crypto.image}
          />
          <div className="buyPrice">
            <p className="buyPrice">Current Price</p>
            <p>${formatPrice(crypto.price)}</p>
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
            <p className="balance">Coin(s)</p>
            <p>{walletQuantity}</p>
          </div>
        </div>
      </div>
      <div className="checkoutDetails">
        <div className="quantitySelectors">
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
              inputProps: { min: 0, max: walletQuantity },
            }}
            value={quantity}
            onChange={(e) => setQuantity(Number.parseInt(e.target.value))}
          />
          <FormControlLabel
            className="checkBox"
            control={<Checkbox onChange={handleChecked} value={checked} />}
            label="sell max"
          />
        </div>

        <p className="totalCalculation">
          Total: ${formatPrice(quantity * crypto.price)}
        </p>
      </div>
      <Button type="submit" className="purchaseBtn" variant="contained">
        Confirm Sell Order
      </Button>
    </form>
  );
};
