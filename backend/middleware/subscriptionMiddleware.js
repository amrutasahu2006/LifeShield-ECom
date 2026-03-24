exports.ensureActiveSubscription = async (user) => {
  if (!user || !user.subscription?.isActive || !user.subscription?.expiryDate) {
    return user;
  }

  const expiryDate = new Date(user.subscription.expiryDate);
  if (expiryDate >= new Date()) {
    return user;
  }

  user.subscription.isActive = false;
  user.subscription.plan = null;
  user.subscription.expiryDate = null;
  await user.save();

  return user;
};
