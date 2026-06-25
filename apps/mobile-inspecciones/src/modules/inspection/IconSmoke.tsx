import React from 'react';
import { View } from 'react-native';
import { ChipMark } from '../../shared/components/icons/ChipMark';
import { ClipboardMark } from '../../shared/components/icons/ClipboardMark';
import { FigmaButtonSparklesMark } from '../../shared/components/icons/FigmaButtonSparklesMark';

export function IconSmoke() {
  return (
    <View>
      <ChipMark />
      <ClipboardMark />
      <FigmaButtonSparklesMark />
    </View>
  );
}
