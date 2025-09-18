import React from "react";
import { View, Text, TouchableOpacity, Modal, Pressable, ScrollView } from "react-native";
import { Notification } from "../hooks/useNotification";

interface Props {
  visible: boolean;
  onClose: () => void;
  notifications: Notification[];
  onOpenStatus: (status: Notification) => void;
}

export default function NotificationDropdown({
  visible,
  onClose,
  notifications,
  onOpenStatus,
}: Props) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        className="flex-1 justify-start items-end pt-40 mt-4 bg-transparent"
      >
        <View className="bg-white rounded-md shadow-lg p-2 w-72 mr-2 mt-2 max-h-96">
          <Text className="text-black font-semibold px-2 pb-2">Thông báo</Text>
          {notifications.length === 0 ? (
            <Text className="text-gray-500 px-2 py-2">Không có tình trạng mới</Text>
          ) : (
            <ScrollView className="max-h-80">
              {notifications.map((n) => (
                <TouchableOpacity
                  key={n._id}
                  className="py-2 px-2 border-b border-gray-200"
                  onPress={() => onOpenStatus(n)}
                >
                  <Text className="text-black font-medium">{n.content}</Text>
                  {!n.had_read && (
                    <View className="absolute top-2 right-2 bg-red-600 w-2 h-2 rounded-full" />
                  )}
                  <Text className="text-xs text-gray-400 mt-1">
                    {new Date(n.timestamp).toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}
