import React from "react";
import { Flip } from 'react-awesome-reveal'; // Пакет для анимации "переворота"

const CoinFlip = ({result, functionallity}) => {
    return (
        <div align="center">
            <Flip triggerOnce={true} onEnd={() => functionallity()}>
                <img
                    src={result === 'heads' ? '/path/to/heads/image' : '/path/to/tails/image'}
                    alt="MISHA"
                    style={{width: '200px', height: '200px'}}
                />
            </Flip>
        </div>
    );
};

export default CoinFlip;
