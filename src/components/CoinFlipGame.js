import React, { useState } from "react";
import CoinFlip from "./CoinFlip";
import { Grid, Button } from "@mui/material";
import { useField } from "../hooks/useField";
import { useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import contractsService from '../services/contractsService';
import { loadBalance } from "../reducers/balanceReducer";
import SelectAmount from "./SelectAmount";
import { useForm } from "react-hook-form";


const CoinFlipGame = ({balance, account}) => {
    console.log("CoinFlipGame started with balance:", balance, "and account:", account);
    const dispatch = useDispatch()
    const [result, setResult] = useState('');
    const betAmount = useField("");
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const betAmount2 = watch("betAmount2", "");
    const [coinSide, setCoinSide] = useState(''); // Добавим состояние для выбора стороны монетки

    const onCoinFlipEnd = async() => {
        console.log("onCoinFlipEnd started");
        await dispatch(loadBalance(account))
        console.log("onCoinFlipEnd ended");
        // Здесь можно добавить логику после окончания вращения монеты
    }

    const handleFlipClick = async(event) => {
        console.log("handleFlipClick started");
        event.preventDefault();
        if (betAmount.value === "") {
            toast.error(`Please select an amount of tokens to bet`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else {
            try {
                console.log("About to call contractsService.playCoinFlip with coinSide:", coinSide, "and betAmount:", betAmount.value);
                const flipResult = await contractsService.playCoinFlip(coinSide, betAmount.value);
                console.log("contractsService.playCoinFlip returned:", flipResult);
                setResult(flipResult.requestId); // Отображаем requestId
            } catch (error) {
                console.log(error); // Выводим подробную информацию об ошибке
                console.log(coinSide);
                console.log(betAmount.value);
                toast.error(`An error has occurred please try again later`, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
        }
        console.log("handleFlipClick ended");
    };

    return (
        <Grid container rowSpacing={3}>
            <Grid item xs={12}>
                <Grid container alignItems="center" justifyContent="center">
                    <CoinFlip
                        result={result}
                        functionallity={onCoinFlipEnd}
                    />
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <form onSubmit={handleFlipClick}>
                    <Grid container rowSpacing={2}>
                        <Grid item xs={12}>
                            <Grid container alignItems="center" justifyContent="center">
                                <SelectAmount
                                    maxValue={balance}
                                    TextFielValue={betAmount.value}
                                    changeValue={(value) => betAmount.change(value)}
                                    onChangeValue={betAmount.onChange}
                                    buttonColor={'#ed6c02'}
                                />
                                <Button onClick={() => setCoinSide(true)}>Heads</Button>
                                <Button onClick={() => setCoinSide(false)}>Tails</Button>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container alignItems="center" justifyContent="center">
                                <Button
                                    style={{
                                        width: "80%",
                                    }}
                                    variant="contained"
                                    color="success"
                                    type="submit"
                                >
                                    Flip a coin
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </form>
            </Grid>
            <ToastContainer />
        </Grid>
    );
};

export default CoinFlipGame;
