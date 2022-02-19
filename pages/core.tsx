import React from "react";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";

const Core: NextPage = () => {
  const [lines, setLines] = React.useState<any[]>([]);
  const handleChange = (e: { target: { value: any } }) => {
    const value = e.target.value;
    const lines = value.split("\n");
    const messagePair = parseAsMessagePair(lines);
    setLines(messagePair);
  };

  const handleDownloadAll = () => {
    const mapped = lines.map((x) => ({
      ["Name"]: x.name,
      ["Message"]: x.message,
      ["Student ID"]: x.studentId,
    }));
    console.log(mapped);
    downloadAsCsv(mapped);
  };
  const handleDownloadAttendance = () => {
    const unique = deduplicate(lines);
    const mapped = unique.map((x, i) => ({
      ["No"]: i + 1,
      ["Name"]: x.name,
      ["Student ID"]: x.studentId,
    }));
    downloadAsCsv(mapped);
  };
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className="container">
          <div className="input-area">
            <textarea onChange={handleChange} rows={40} cols={60}></textarea>
          </div>
          <div className="preview">
            <div className="action">
              <button onClick={handleDownloadAll}>Download All Messages</button>
              <button onClick={handleDownloadAttendance}>
                Download Attendance Sheet
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Message</th>
                  <th>Student ID</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => {
                  const { name, message, studentId } = line;
                  return (
                    <tr key={index}>
                      <td>{name}</td>
                      <td>{message}</td>
                      <td>{studentId}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        Scripted by -- <strong> CSE-221-F Programmers</strong>
      </footer>
    </div>
  );
};

export default Core;

const parseAsMessagePair = (lines: string[]) => {
  const result: any[] = [];
  let temp: any = { name: null, message: null };
  lines.forEach((line, index) => {
    const isName = /to Everyone \(*/;
    if (isName.test(line) && !temp.name) {
      const parsedName = line.split(isName)[0].trim();
      temp.name = parsedName;
    } else if (temp.name) {
      const message = line.trim();
      temp.message = message;
      temp.isStudentId = isStudentId(message);
      if (temp.isStudentId) temp.studentId = parseStudentId(message);
      if (isStudentId(cleanNumber(temp.name)))
        temp.studentId = parseStudentId(cleanNumber(temp.name));
      result.push({ ...temp });
      temp = {};
    }
  });
  return result;
};

const isStudentId = (line: string) => {
  const regex = /^\d{9}$/;
  const regex2 = /^\d{3}$/;
  return regex.test(line) || regex2.test(line);
};

const parseStudentId = (line: string) => {
  if (line.length === 3) return +("221902" + line);
  if (line.length === 9) return +line;
  return null;
};

const cleanNumber = (line: string) => line.replaceAll(/[^0-9]/g, "");

const arrayToCSV = (lines: any[]) => {
  const header = Object.keys(lines[0]).join(",");
  const result: any[] = [header];
  lines.forEach((line, index) => {
    const values = Object.values<string>(line).map(escapeCsv).join(",");
    result.push(values);
  });
  return result.join("\n");
};

const escapeCsv = (line: string) => {
  const result = String(line || "").replace(/,/g, ";");
  return result;
};

const downloadAsCsv = (lines: any[]) => {
  const csv = arrayToCSV(lines);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const date = new Date().toLocaleDateString();
  link.download = date + "-" + "attendance.csv";
  link.click();
};

const deduplicate = (lines: any[]) => {
  const studentIds = lines
    .map<number>((line) => line.studentId)
    .filter((id) => id);
  const uniqueIds = new Set(studentIds);

  const result: any[] = [];
  lines.forEach((line, index) => {
    if (uniqueIds.has(line.studentId)) {
      result.push(line);
      uniqueIds.delete(line.studentId);
    }
  });
  return result;
};