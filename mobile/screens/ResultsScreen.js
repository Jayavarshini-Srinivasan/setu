import { useEffect, useState } from "react";

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
} from "react-native";

import API from "../services/api";


export default function ResultsScreen({
  route,
}) {
  const { workerProfile } = route.params;

  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchMatchedJobs();
  }, []);

  const fetchMatchedJobs = async () => {
    try {
      const response = await API.post(
        "/match",
        workerProfile
      );

      setJobs(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  const handleApply = async (jobId) =>{
    try{
        await API.post("/apply",{
            workerProfile,
            jobId,
    });

    alert("Application submitted successfully");
    } catch(error){
        console.log(error);
        alert("Failed to submit the application. Please try again");
    }
  };
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>
        {item.title}
      </Text>

      <Text>
        Location: {item.location}
      </Text>

      <Text>
        Salary: ₹{item.salary}
      </Text>

      <Text>
        Match Score: {item.matchScore}
      </Text>

      <Button
        title="Apply"
        onPress={() =>
          handleApply(item.id)
        }
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={jobs}
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },

  card: {
    borderWidth: 1,
    padding: 15,
    marginBottom: 15,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
});