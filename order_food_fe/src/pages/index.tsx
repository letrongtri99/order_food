import React, { useState } from "react";
// import { useTestQuery } from "../generated/graphql";
import { withApollo } from "../utils/withApollo";
import Layout from "../components/Layout";

const Index = ({}) => {
  return <Layout></Layout>;
};

export default withApollo({ ssr: true })(Index);
