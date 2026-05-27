const { db, admin } = require("../config/firebase");

const getNotifications = async (req, res) => {
  try {
    const uid = req.user.uid;
    const notificationsSnapshot = await db
      .collection("users")
      .doc(uid)
      .collection("notifications")
      .orderBy("createdAt", "desc")
      .get();
      
    const notifications = notificationsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
      };
    });
    
    res.status(200).json(notifications);
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const uid = req.user.uid;
    
    await db
      .collection("users")
      .doc(uid)
      .collection("notifications")
      .doc(id)
      .update({ 
        status: "read",
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("MARK AS READ ERROR:", error);
    res.status(500).json({ error: "Failed to mark as read" });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const uid = req.user.uid;
    
    const unreadSnapshot = await db
      .collection("users")
      .doc(uid)
      .collection("notifications")
      .where("status", "==", "unread")
      .get();
      
    const batch = db.batch();
    unreadSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { 
        status: "read",
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("MARK ALL READ ERROR:", error);
    res.status(500).json({ error: "Failed to mark all as read" });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
