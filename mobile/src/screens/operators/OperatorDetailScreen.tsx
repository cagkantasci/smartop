import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { usersApi, machinesApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { User, Machine } from '../../types';

type RouteParams = {
  OperatorDetail: { userId: string };
};

export default function OperatorDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'OperatorDetail'>>();
  const { userId } = route.params;
  const { user: currentUser } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [assignedMachines, setAssignedMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const [userData, machinesData] = await Promise.all([
        usersApi.getById(userId),
        machinesApi.getAll(),
      ]);
      setUser(userData);
      // Filter machines assigned to this operator
      const assigned = machinesData.filter(
        (m: Machine) => m.assignedOperatorId === userId
      );
      setAssignedMachines(assigned);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      Alert.alert('Hata', 'Kullanıcı bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (user?.phone) {
      Linking.openURL(`tel:${user.phone}`);
    }
  };

  const handleEmail = () => {
    if (user?.email) {
      Linking.openURL(`mailto:${user.email}`);
    }
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
        return 'Admin';
      case 'manager':
        return 'Yönetici';
      case 'operator':
        return 'Operatör';
      default:
        return role;
    }
  };

  const getMachineStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'maintenance':
        return 'bg-orange-500';
      case 'out_of_service':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#F59E0B" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <Ionicons name="person-outline" size={64} color="#9CA3AF" />
        <Text className="text-gray-500 dark:text-gray-400 mt-4">
          Kullanıcı bulunamadı
        </Text>
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
          Profil
        </Text>
        {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
          <TouchableOpacity
            onPress={() => navigation.navigate('EditOperator', { userId })}
          >
            <Ionicons name="create-outline" size={24} color="#F59E0B" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="bg-white dark:bg-gray-800 m-4 rounded-xl p-6 shadow-sm">
          {/* Avatar & Name */}
          <View className="items-center">
            <View className="w-24 h-24 rounded-full bg-amber-500 items-center justify-center mb-4">
              <Text className="text-white text-3xl font-bold">
                {user.firstName[0]}{user.lastName[0]}
              </Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.firstName} {user.lastName}
            </Text>
            {user.jobTitle && (
              <Text className="text-gray-500 dark:text-gray-400 mt-1">
                {user.jobTitle}
              </Text>
            )}
            <View className={`${getRoleColor(user.role)} px-4 py-1 rounded-full mt-2`}>
              <Text className="text-white font-medium">
                {getRoleLabel(user.role)}
              </Text>
            </View>
            <View className="flex-row items-center mt-2">
              <View className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'} mr-2`} />
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                {user.isActive ? 'Aktif' : 'Pasif'}
              </Text>
            </View>
          </View>

          {/* Contact Buttons */}
          <View className="flex-row mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center py-3 mr-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl"
              onPress={handleCall}
              disabled={!user.phone}
            >
              <Ionicons name="call" size={20} color={user.phone ? '#3B82F6' : '#9CA3AF'} />
              <Text className={`ml-2 font-medium ${user.phone ? 'text-blue-500' : 'text-gray-400'}`}>
                Ara
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center py-3 bg-green-50 dark:bg-green-900/30 rounded-xl"
              onPress={handleEmail}
            >
              <Ionicons name="mail" size={20} color="#10B981" />
              <Text className="ml-2 text-green-500 font-medium">E-posta</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Info */}
        <View className="bg-white dark:bg-gray-800 mx-4 rounded-xl p-4 shadow-sm mb-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            İletişim Bilgileri
          </Text>
          <View className="space-y-3">
            <View className="flex-row items-center">
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
              <Text className="ml-3 text-gray-700 dark:text-gray-300 flex-1">
                {user.email}
              </Text>
            </View>
            <View className="flex-row items-center mt-3">
              <Ionicons name="call-outline" size={20} color="#9CA3AF" />
              <Text className="ml-3 text-gray-700 dark:text-gray-300 flex-1">
                {user.phone || 'Belirtilmemiş'}
              </Text>
            </View>
          </View>
        </View>

        {/* Licenses & Specialties */}
        {(user.licenses?.length > 0 || user.specialties?.length > 0) && (
          <View className="bg-white dark:bg-gray-800 mx-4 rounded-xl p-4 shadow-sm mb-4">
            {user.licenses?.length > 0 && (
              <View className="mb-4">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Lisanslar
                </Text>
                <View className="flex-row flex-wrap">
                  {user.licenses.map((license, idx) => (
                    <View
                      key={idx}
                      className="bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg mr-2 mb-2"
                    >
                      <Text className="text-blue-600 dark:text-blue-400 font-medium">
                        {license}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {user.specialties?.length > 0 && (
              <View>
                <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Uzmanlık Alanları
                </Text>
                <View className="flex-row flex-wrap">
                  {user.specialties.map((specialty, idx) => (
                    <View
                      key={idx}
                      className="bg-purple-50 dark:bg-purple-900/30 px-3 py-2 rounded-lg mr-2 mb-2"
                    >
                      <Text className="text-purple-600 dark:text-purple-400 font-medium">
                        {specialty}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Assigned Machines */}
        <View className="bg-white dark:bg-gray-800 mx-4 rounded-xl p-4 shadow-sm mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Atanan Makineler ({assignedMachines.length})
          </Text>
          {assignedMachines.length > 0 ? (
            assignedMachines.map((machine) => (
              <TouchableOpacity
                key={machine.id}
                className="flex-row items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                onPress={() => navigation.navigate('MachineDetail', { machineId: machine.id })}
              >
                <View className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 items-center justify-center mr-3">
                  <Ionicons name="construct" size={20} color="#F59E0B" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 dark:text-white font-medium">
                    {machine.name}
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    {machine.brand} {machine.model}
                  </Text>
                </View>
                <View className={`${getMachineStatusColor(machine.status)} px-2 py-1 rounded-full`}>
                  <Text className="text-white text-xs font-medium">
                    {machine.status === 'active' ? 'Aktif' :
                     machine.status === 'idle' ? 'Boşta' :
                     machine.status === 'maintenance' ? 'Bakımda' : 'Servis Dışı'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="items-center py-6">
              <Ionicons name="construct-outline" size={40} color="#9CA3AF" />
              <Text className="text-gray-500 dark:text-gray-400 mt-2 text-center">
                Atanmış makine yok
              </Text>
            </View>
          )}
        </View>

        {/* Activity Stats */}
        <View className="bg-white dark:bg-gray-800 mx-4 rounded-xl p-4 shadow-sm mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Aktivite
          </Text>
          <View className="flex-row">
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-amber-500">
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('tr-TR') : '-'}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Son Giriş
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-green-500">
                {assignedMachines.length}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Makine
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
