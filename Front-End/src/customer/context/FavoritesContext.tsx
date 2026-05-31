import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HotelCardProps } from '@/src/customer/features/hotels/HotelCard';

const FAVORITES_STORAGE_KEY = '@stayhub_favorite_hotels';

interface FavoritesContextType {
    favorites: HotelCardProps[];
    addFavorite: (hotel: HotelCardProps) => Promise<void>;
    removeFavorite: (hotelId: number | string) => Promise<void>;
    toggleFavorite: (hotel: HotelCardProps) => Promise<void>;
    isFavorite: (hotelId: number | string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const [favorites, setFavorites] = useState<HotelCardProps[]>([]);

    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
                if (stored) {
                    setFavorites(JSON.parse(stored));
                }
            } catch (error) {
                console.error('Failed to load favorites:', error);
            }
        };
        loadFavorites();
    }, []);

    const saveFavorites = async (newFavorites: HotelCardProps[]) => {
        try {
            await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
            setFavorites(newFavorites);
        } catch (error) {
            console.error('Failed to save favorites:', error);
        }
    };

    const addFavorite = async (hotel: HotelCardProps) => {
        const newFavorites = [hotel, ...favorites.filter(f => f.id !== hotel.id)];
        await saveFavorites(newFavorites);
    };

    const removeFavorite = async (hotelId: number | string) => {
        const newFavorites = favorites.filter(f => f.id !== hotelId);
        await saveFavorites(newFavorites);
    };

    const toggleFavorite = async (hotel: HotelCardProps) => {
        if (isFavorite(hotel.id)) {
            await removeFavorite(hotel.id);
        } else {
            await addFavorite(hotel);
        }
    };

    const isFavorite = (hotelId: number | string) => {
        return favorites.some(f => f.id === hotelId);
    };

    return (
        <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavoritesContext() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavoritesContext must be used within a FavoritesProvider');
    }
    return context;
}
