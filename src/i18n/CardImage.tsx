import React from 'react';
import {Image as NativeImage,type ImageProps} from 'react-native';
import {useLocale,t} from './locale';

/** Localize accessibility text only. Artwork is identical in every language. */
export default function CardImage(props:ImageProps){
 useLocale();
 return <NativeImage {...props} accessibilityLabel={props.accessibilityLabel?t(props.accessibilityLabel):undefined}/>;
}
