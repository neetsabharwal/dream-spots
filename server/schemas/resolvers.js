const { AuthenticationError } = require("apollo-server-express");
const { User, Spot } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select("-__v -password")
          .populate("savedSpots");

        return userData;
      }

      throw new AuthenticationError("Not logged in");
    },
    helloWorld: () => {
      return "Hello purple world!";
    },
    spots: async () => {
      return Spot.find();
    },
  },
  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);
      return { token, user };
    },

    addSpot: async (parent, args) => {
      const spot = await Spot.create(args);

      return spot;
    },
  },
};

module.exports = resolvers;
