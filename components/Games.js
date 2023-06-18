import React from 'react';
import { Avatar, Grid, Typography} from '@mui/material';
import RouleteIcon from "../images/rouleteIcon.png";
import RouletteImage from "../images/rouletteImage.webp";
import GameButton from './GameButton';
import starImage from "../images/Gold-Star-PNG-Photos.png"
import CoinFlipIcon from "../images/coinFlipIcon.png"; // Импортируйте иконку для Coin Flip
import CoinFlipImage from "../images/coinFlipImage.webp";   // Импортируйте изображение для Coin Flip

const rouletteImage = {
    url: RouletteImage,
    title: <Grid container alignItems="center" justifyContent="center" columnSpacing={1} sx={{width:'100%'}}>
        <Grid item display={{ xs: "none", md: "contents" }}>
            <Avatar
                alt=""
                src={RouleteIcon}
                sx={{ width: 40, height: 40 }}
                display={{ xs: "none", md: "contents" }}
            />
        </Grid>
        <Grid item>
            <Typography variant='h5' sx={{color:'#FFFFFF'}}>Roulette</Typography>
        </Grid>
    </Grid>,
};

const coinFlipImage = {
    url: CoinFlipImage,
    title: <Grid container alignItems="center" justifyContent="center" columnSpacing={1} sx={{width:'100%'}}>
        <Grid item display={{ xs: "none", md: "contents" }}>
            <Avatar
                alt=""
                src={CoinFlipIcon}
                sx={{ width: 40, height: 40 }}
                display={{ xs: "none", md: "contents" }}
            />
        </Grid>
        <Grid item>
            <Typography variant='h5' sx={{color:'#FFFFFF'}}>Coin Flip</Typography>
        </Grid>
    </Grid>,
};

const Roulette = () =>{
    return(
        <Grid item>
            <Grid container alignItems="center" justifyContent="center" spacing={1}>
                <Grid item xs = {12}>
                    <Grid container alignItems="center" justifyContent="center">
                        <Grid item>
                            <Avatar
                                alt=""
                                src={starImage}
                                sx={{ width: 50, height: 50 }}
                            />
                        </Grid>
                        <Grid item>
                            <Typography variant='h3' sx={{color:'#FFFFFF', fontSize:'1'}}>Games</Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs = {12}>
                    <Grid container alignItems="center" justifyContent="center">
                        <GameButton games={rouletteImage} route="Roulette"/>
                        <GameButton games={coinFlipImage} route="CoinFlip"/> {/* Добавьте новую кнопку для Coin Flip */}
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}

const Games = () => {
    return (
        <Grid container alignItems="center" justifyContent="center">
            <Roulette />
        </Grid>

    )
}
export default Games
