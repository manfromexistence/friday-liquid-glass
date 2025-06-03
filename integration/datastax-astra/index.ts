// {
//     "clientId": "CwjeYSbqkTQrrbYifaDKLUIH",
//     "secret": "OmaxsxA6OUPSfeQYxc7juuzHuDBASnIqj61,tZZn9pU_mADPfcB8xpKmW3Cspa-CFpPdMEfRN4srl,9ULE7rZAjCU1Tlzh,7ePmK_ZWGSU+eg+Nl1pk8nI6vETMm1RcQ",
//     "token": "AstraCS:CwjeYSbqkTQrrbYifaDKLUIH:95c479346714000b3ff8d42da7367ec31a8f8db4136e6fd66092b3eac9a0b519"
//   }

// export ASTRA_DB_ID=1221286c-c08e-41ba-a94d-37a0b3e22e81
// export ASTRA_DB_REGION=eu-west-1
// export ASTRA_DB_KEYSPACE=friday
// export ASTRA_DB_APPLICATION_TOKEN=AstraCS:CwjeYSbqkTQrrbYifaDKLUIH:95c479346714000b3ff8d42da7367ec31a8f8db4136e6fd66092b3eac9a0b519

const { createClient } = require("@astrajs/rest");
  
async function main() {
  // create an Astra DB client
  const astraClient = await createClient({
    astraDatabaseId: process.env.ASTRA_DB_ID,
    astraDatabaseRegion: process.env.ASTRA_DB_REGION,
    applicationToken: process.env.ASTRA_DB_APPLICATION_TOKEN,
  });
  console.log("Connection to Astra OK, baseUrl is: " + astraClient.baseUrl);

  const basePath = `/api/rest/v2/namespaces/friday/collections/users`;
  console.log("basePath is: " + basePath + "");

  // create a new user without a document id
  const putNewUserRes = await astraClient.post(basePath, {
    name: "cliff",
  });
  console.log("New user without a document ID: ", putNewUserRes.data, putNewUserRes.status);

  // create a new user with a document id
  const putNewUserWithIdRes = await astraClient.put(
    `${basePath}/cliff@wicklow.com`,
    {
      name: "cliff",
    }
  );
  console.log("New user with a document ID: ", putNewUserWithIdRes.data, putNewUserWithIdRes.status);

  // create a user subdocument
  const putUserSubdocumentRes = await astraClient.put(
    `${basePath}/cliff@wicklow.com/blog`,
    {
      title: "new blog",
    }
  );
  console.log("Create a user subdocument: ", putUserSubdocumentRes.data, putUserSubdocumentRes.status);

  // get a single user by document id
  const getUserRes = await astraClient.get(`${basePath}/cliff@wicklow.com`);
  console.log("Get user by document ID: ", getUserRes.data, getUserRes.status);

  // get a subdocument by path
  const getSubdocumentRes = await astraClient.get(
    `${basePath}/cliff@wicklow.com/blog`
  );
  console.log("Get a subdocument: ", getSubdocumentRes.data, getSubdocumentRes.status);

  // search a collection of documents
  const getDocumentCollectionRes = await astraClient.get(basePath, {
    params: {
      where: {
        name: { $eq: "cliff" },
      },
    },
  });
  console.log("Search a collection of documents", getDocumentCollectionRes.data, getDocumentCollectionRes.status);

  // partially update user
  const patchUserRes = await astraClient.patch(
    `${basePath}/cliff@wicklow.com`,
    {
      name: "Cliff",
    }
  );
  console.log("Partially update user", patchUserRes.data, patchUserRes.status);

  // delete a user
  const deleteUserRes = await astraClient.delete(
    `${basePath}/cliff@wicklow.com`
  );
  console.log("Delete user 'cliff@wicklow.com'", deleteUserRes.status);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});