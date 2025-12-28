const conversationRepo = require("../repositories/conversation.repository");
const profileRepo = require("../repositories/profile.repository");

const createConversation = async (type, title, creatorId, members = []) => {
  try {
    // 1. Tạo hội thoại
    const conversation = await conversationRepo.createConversation(type, title);

    if (type === "private") {
      // ✅ Private: cả 2 đều member
      for (const user_id of [creatorId, ...members]) {
        const name = await profileRepo.getName(user_id);
        await conversationRepo.addMember(conversation.id, user_id, "member", name);
      }
    } else {
      // ✅ Group/Channel: creator = owner, các user khác = member
      const creatorName = await profileRepo.getName(creatorId);
      await conversationRepo.addMember(conversation.id, creatorId, "owner", creatorName);

      for (const user_id of members) {
        if (user_id !== creatorId) {
          const name = await profileRepo.getName(user_id);
          await conversationRepo.addMember(conversation.id, user_id, "member", name);
        }
      }
    }

    return conversation;
  } catch (error) {
    console.error('conversation.service.createConversation error:', error);
    throw error;
  }
};

const getConversations = async (accountId) => {
  try {
    return await conversationRepo.getConversations(accountId);
  } catch (error) {
    console.error('conversation.service.getConversations error:', error);
    throw error;
  }
};

module.exports = {
  createConversation,
  getConversations
};
