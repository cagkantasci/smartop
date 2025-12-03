import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usersApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { User } from '../../types';

type FilterRole = 'all' | 'operator' | 'manager';

export default function OperatorListScreen() {
  const navigation = useNavigation<any>();
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<FilterRole>('all');

  const fetchUsers = useCallback(async () => {
    try {
      const data = await usersApi.getAll();
      setUsers(data);
      filterUsers(data, searchQuery, roleFilter);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      Alert.alert(t.common.error, t.operators.messages.loadError);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, roleFilter, t]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const filterUsers = (userList: User[], query: string, role: FilterRole) => {
    let filtered = userList;

    // Filter by role
    if (role !== 'all') {
      filtered = filtered.filter((u) => u.role === role);
    }

    // Filter by search query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.firstName.toLowerCase().includes(lowerQuery) ||
          u.lastName.toLowerCase().includes(lowerQuery) ||
          u.email.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredUsers(filtered);
  };

  useEffect(() => {
    filterUsers(users, searchQuery, roleFilter);
  }, [searchQuery, roleFilter, users]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500';
      case 'manager':
        return 'bg-blue-500';
      case 'operator':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return t.operators.role.admin;
      case 'manager':
        return t.operators.role.manager;
      case 'operator':
        return t.operators.role.operator;
      default:
        return role;
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500' : 'bg-red-500';
  };

  const renderUserCard = ({ item }: { item: User }) => (
    <TouchableOpacity
      className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 mx-4 shadow-sm"
      onPress={() => navigation.navigate('OperatorDetail', { userId: item.id })}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        {/* Avatar */}
        <View className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center mr-3">
          {item.avatarUrl ? (
            <View className="w-12 h-12 rounded-full bg-amber-500 items-center justify-center">
              <Text className="text-white text-lg font-bold">
                {item.firstName[0]}{item.lastName[0]}
              </Text>
            </View>
          ) : (
            <Text className="text-gray-600 dark:text-gray-300 text-lg font-bold">
              {item.firstName[0]}{item.lastName[0]}
            </Text>
          )}
        </View>

        {/* Info */}
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-gray-900 dark:text-white font-semibold text-base">
              {item.firstName} {item.lastName}
            </Text>
            <View className={`ml-2 w-2 h-2 rounded-full ${getStatusColor(item.isActive)}`} />
          </View>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            {item.email}
          </Text>
          {item.jobTitle && (
            <Text className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
              {item.jobTitle}
            </Text>
          )}
        </View>

        {/* Role Badge & Arrow */}
        <View className="items-end">
          <View className={`${getRoleColor(item.role)} px-2 py-1 rounded-full`}>
            <Text className="text-white text-xs font-medium">
              {getRoleLabel(item.role)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" style={{ marginTop: 8 }} />
        </View>
      </View>

      {/* Licenses */}
      {item.licenses && item.licenses.length > 0 && (
        <View className="flex-row flex-wrap mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          {item.licenses.slice(0, 3).map((license, idx) => (
            <View key={idx} className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mr-1 mb-1">
              <Text className="text-gray-600 dark:text-gray-300 text-xs">{license}</Text>
            </View>
          ))}
          {item.licenses.length > 3 && (
            <View className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mr-1 mb-1">
              <Text className="text-gray-600 dark:text-gray-300 text-xs">
                +{item.licenses.length - 3}
              </Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View className="px-4 py-3">
      {/* Search Bar */}
      <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2 mb-3">
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          className="flex-1 ml-2 text-gray-900 dark:text-white"
          placeholder={t.operators.search}
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Role Filter */}
      <View className="flex-row">
        {(['all', 'operator', 'manager'] as FilterRole[]).map((role) => (
          <TouchableOpacity
            key={role}
            className={`flex-1 py-2 rounded-lg mr-2 ${
              roleFilter === role
                ? 'bg-amber-500'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
            onPress={() => setRoleFilter(role)}
          >
            <Text
              className={`text-center font-medium ${
                roleFilter === role
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {role === 'all' ? t.operators.filter.all : role === 'operator' ? t.operators.filter.operators : t.operators.filter.managers}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats */}
      <View className="flex-row mt-3 mb-2">
        <View className="flex-1 bg-green-50 dark:bg-green-900/30 rounded-lg p-2 mr-2">
          <Text className="text-green-600 dark:text-green-400 text-xs">{t.operators.status.active}</Text>
          <Text className="text-green-700 dark:text-green-300 font-bold text-lg">
            {filteredUsers.filter((u) => u.isActive).length}
          </Text>
        </View>
        <View className="flex-1 bg-red-50 dark:bg-red-900/30 rounded-lg p-2 mr-2">
          <Text className="text-red-600 dark:text-red-400 text-xs">{t.operators.status.inactive}</Text>
          <Text className="text-red-700 dark:text-red-300 font-bold text-lg">
            {filteredUsers.filter((u) => !u.isActive).length}
          </Text>
        </View>
        <View className="flex-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-2">
          <Text className="text-blue-600 dark:text-blue-400 text-xs">{t.operators.status.total}</Text>
          <Text className="text-blue-700 dark:text-blue-300 font-bold text-lg">
            {filteredUsers.length}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text className="text-gray-500 dark:text-gray-400 mt-2">{t.common.loading}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#F59E0B" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">
          {t.operators.title}
        </Text>
        {currentUser?.role === 'admin' || currentUser?.role === 'manager' ? (
          <TouchableOpacity
            className="bg-amber-500 p-2 rounded-full"
            onPress={() => navigation.navigate('AddOperator')}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUserCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Ionicons name="people-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 dark:text-gray-400 mt-4 text-center">
              {searchQuery || roleFilter !== 'all'
                ? t.operators.empty.filtered
                : t.operators.empty.noOperators}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#F59E0B"
            colors={['#F59E0B']}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}
