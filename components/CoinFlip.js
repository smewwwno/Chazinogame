import React from "react";
import { Flip } from 'react-awesome-reveal'; // Пакет для анимации "переворота"

const CoinFlip = ({result, functionallity, flipTrigger}) => {
    return (
        <div align="center">
            <Flip triggerOnce={flipTrigger} onEnd={() => functionallity()}>
                <img
                    src={result === 0 ? '../images/heads.jpg' : '../images/tails.jpg'}
                    alt={"MISHA"}
                    style={{width: '200px', height: '200px'}}
                    />
                </Flip>
            </div>
        );
    };

    export default CoinFlip;
