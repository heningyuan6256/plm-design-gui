import React, { Fragment } from 'react';
export interface PlmMosaicProps {
    inLine?: Boolean;
}
/** 马赛克`~#~` */
const mosaic = '~#~';

/**
 * 判断有阅读权限
 */
export const readPermission = (value: string) => {
    return !['1999-09-09 09:09:09', mosaic, '1999-09-09 09:09:9'].includes((typeof value === 'string' && value) ? value.trim() : '');
}

export const renderIsPlmMosaic = ({ value, inLine, children }: { value: string, inLine?: boolean, children: React.ReactNode | string }) => {
    if (readPermission(value)) {
        return <Fragment>{children}</Fragment>
    } else {
        return <PlmMosaic></PlmMosaic>
    }
}

const PlmMosaic: React.FC<PlmMosaicProps> = (props) => {
    return <span className={"mosaic"} style={{ display: props.inLine ? 'inline-block' : 'block' }}></span>;
};

export default PlmMosaic;
