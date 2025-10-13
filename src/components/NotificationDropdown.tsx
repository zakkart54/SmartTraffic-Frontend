import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable, ScrollView } from "react-native";
import { Notification } from "../hooks/useNotification";

interface Props {
  visible: boolean;
  onClose: () => void;
  notifications: Notification[];
  onOpenStatus: (status: Notification) => void;
  hasUnread?: boolean;
}

export default function NotificationDropdown({
  visible,
  onClose,
  notifications,
  onOpenStatus,
  hasUnread,
}: Props) {
  const [toggle, setToggle] = React.useState(hasUnread || false);
    const sortedNotifications = useMemo(() => {
      return [...notifications].sort((a, b) => {
        const dateA = new Date(a?.createdDate || a?.timestamp).getTime();
        const dateB = new Date(b?.createdDate || b?.createdDate).getTime();
        return dateB - dateA;
      });
    }, [notifications]);
  
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        className="flex-1 justify-start items-end pt-40 mt-4 bg-transparent"
      >
        <View className="bg-white rounded-md shadow-lg p-2 w-72 mr-2 mt-2 max-h-96">
          <View className="flex-row justify-between items-center px-2 pb-2">
            <Text className="text-black font-semibold">Thông báo</Text>
            {notifications.length > 0 && toggle && (
              <TouchableOpacity onPress={() => setToggle(!toggle)}>
                <Text className="text-blue-500 text-sm">Đánh dấu đã xem</Text>
              </TouchableOpacity>
            )}
          </View>

          {sortedNotifications.length === 0 ? (
            <Text className="text-gray-500 px-2 py-2">Không có tình trạng mới</Text>
          ) : (
            <ScrollView className="max-h-80">
              {sortedNotifications.map((n, index) => (
                <TouchableOpacity
                  key={n._id}
                  className="py-2 px-2 border-b border-gray-200 relative"
                  onPress={() => onOpenStatus(n)}
                >
                  {n.type === 'VALIDATION' && (
                    <Text className="text-blue-700 font-semibold mb-1">
                      Thông báo dữ liệu đã gửi
                    </Text>
                  )}
                  {n.type === 'STATUS' && (
                    <Text className="text-green-700 font-semibold mb-1">
                      Tình trạng giao thông
                    </Text>
                  )}
                  <Text className="text-black font-medium">{n.content}</Text>
                  {!n.had_read && toggle && (
                    <View className="absolute top-2 right-2 bg-red-600 w-2 h-2 rounded-full" />
                  )}
                  <Text className="text-xs text-gray-400 mt-1">
                    {new Date(n.timestamp || n.createdDate).toLocaleString()}
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
