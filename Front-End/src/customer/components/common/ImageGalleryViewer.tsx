import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImageWithFallback from '@/src/customer/components/common/ImageWithFallback';
import { getCustomerWebModalFrame, useCustomerWebShell } from '@/src/customer/navigation/CustomerWebShellContext';

interface ImageGalleryViewerProps {
  visible: boolean;
  images: string[];
  initialIndex?: number;
  title?: string;
  onClose: () => void;
}

function clampIndex(index: number, count: number) {
  return Math.min(Math.max(index, 0), Math.max(count - 1, 0));
}

export default function ImageGalleryViewer({
  visible,
  images,
  initialIndex = 0,
  title,
  onClose,
}: ImageGalleryViewerProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { isWebLayout, sidebarWidth } = useCustomerWebShell();
  const viewerWidth = isWebLayout ? Math.max(width - sidebarWidth, 320) : width;
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(clampIndex(initialIndex, images.length));
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const safeIndex = clampIndex(initialIndex, images.length);
    setCurrentIndex(safeIndex);
    setZoomed(false);
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ x: safeIndex * viewerWidth, animated: false });
    }, 0);

    return () => clearTimeout(timer);
  }, [images.length, initialIndex, viewerWidth, visible]);

  const updateIndex = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = clampIndex(Math.round(event.nativeEvent.contentOffset.x / viewerWidth), images.length);
    setCurrentIndex(prev => {
      if (prev !== nextIndex) {
        setZoomed(false);
      }
      return prev === nextIndex ? prev : nextIndex;
    });
  };

  const goToImage = (index: number) => {
    const safeIndex = clampIndex(index, images.length);
    setCurrentIndex(safeIndex);
    setZoomed(false);
    scrollRef.current?.scrollTo({ x: safeIndex * viewerWidth, animated: true });
  };

  if (images.length === 0) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent={isWebLayout} onRequestClose={onClose}>
      <View
        style={[
          styles.container,
          isWebLayout && getCustomerWebModalFrame(sidebarWidth),
          { paddingTop: insets.top + 10, paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.iconBtn} hitSlop={10}>
            <X size={24} color="#fff" />
          </Pressable>
          <View style={styles.titleWrap}>
            {!!title && <Text style={styles.title} numberOfLines={1}>{title}</Text>}
            <Text style={styles.counter}>{currentIndex + 1} / {images.length}</Text>
          </View>
          <View style={styles.iconSpacer} />
        </View>

        <View style={styles.viewer}>
          {images.length > 1 && (
            <Pressable style={[styles.navBtn, styles.navLeft]} onPress={() => goToImage(currentIndex - 1)}>
              <ChevronLeft size={30} color="#fff" />
            </Pressable>
          )}

          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={updateIndex}
            onMomentumScrollEnd={updateIndex}
            scrollEventThrottle={16}
          >
            {images.map((image, index) => (
              <View key={`${image}-${index}`} style={[styles.imagePage, { width: viewerWidth }]}>
                <Pressable onPress={() => setZoomed(prev => !prev)} style={styles.zoomTarget}>
                  <ImageWithFallback
                    uri={image}
                    alt={title || 'Ảnh'}
                    contentFit="contain"
                    style={[
                      {
                        width: viewerWidth,
                        height: Math.max(height - insets.top - insets.bottom - 138, 260),
                      },
                      index === currentIndex && zoomed && styles.zoomedImage,
                    ]}
                  />
                </Pressable>
              </View>
            ))}
          </ScrollView>

          {images.length > 1 && (
            <Pressable style={[styles.navBtn, styles.navRight]} onPress={() => goToImage(currentIndex + 1)}>
              <ChevronRight size={30} color="#fff" />
            </Pressable>
          )}
        </View>

        {images.length > 1 && (
          <View style={styles.dots}>
            {images.map((_, index) => (
              <View key={index} style={[styles.dot, index === currentIndex && styles.dotActive]} />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  header: {
    minHeight: 54,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSpacer: {
    width: 42,
    height: 42,
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  title: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    maxWidth: '100%',
  },
  counter: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  viewer: {
    flex: 1,
    justifyContent: 'center',
  },
  imagePage: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  zoomTarget: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  zoomedImage: {
    transform: [{ scale: 1.28 }],
  },
  navBtn: {
    position: 'absolute',
    top: '50%',
    zIndex: 2,
    width: 46,
    height: 46,
    marginTop: -23,
    borderRadius: 23,
    backgroundColor: 'rgba(0,0,0,0.34)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLeft: {
    left: 14,
  },
  navRight: {
    right: 14,
  },
  dots: {
    minHeight: 32,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.38)',
  },
  dotActive: {
    width: 22,
    backgroundColor: '#fff',
  },
});
