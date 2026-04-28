import { Container, Grid, Paper, Box, Typography } from '@mui/material'
import SeeNotice from '../../components/SeeNotice';
import Students from "../../assets/img1.png";
import Classes from "../../assets/img2.png";
import Teachers from "../../assets/img3.png";
import Fees from "../../assets/img4.png";
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";  
import { getAllSclasses } from '../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import { getAllTeachers } from '../../redux/teacherRelated/teacherHandle';



  const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://sms-xi-rose.vercel.app"
    : "http://localhost:5001";

const AdminHomePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [totalFees, setTotalFees] = useState(0);
    const { studentsList } = useSelector((state) => state.student);
    const { sclassesList } = useSelector((state) => state.sclass);
    const { teachersList } = useSelector((state) => state.teacher);
    const { currentUser } = useSelector(state => state.user);

    const adminID = currentUser?._id;
  
  useEffect(() => {
    const fetchFees = async () => {
        try {
            const res = await fetch(`${BASE_URL}/AllFees`);
            const data = await res.json();
            
            // Log data to console to verify structure
            console.log("Fetched Fees Data:", data);

            // Handle both array and object formats
            const actualFees = Array.isArray(data) ? data : (data.allFees || []);
            
            const total = actualFees.reduce((sum, fee) => {
                const amount = Number(fee.amount);
                return sum + (isNaN(amount) ? 0 : amount);
            }, 0);

            setTotalFees(total);
        } catch (error) {
            console.log("Error fetching fees:", error);
        }
    };
    fetchFees();
}, []);

    useEffect(() => {
        if (adminID) {
            dispatch(getAllStudents(adminID));
            dispatch(getAllSclasses(adminID, "Sclass"));
            dispatch(getAllTeachers(adminID));
        }
    }, [adminID, dispatch]);

    const numberOfStudents = studentsList?.length || 0;
    const numberOfClasses = sclassesList?.length || 0;
    const numberOfTeachers = teachersList?.length || 0;

    return (
        <Container maxWidth="lg" sx={{ mt: { xs: 3, md: 6 }, mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 4, color: '#1e293b', fontWeight: 500, px: { xs: 1, md: 0 } }}>
                Welcome back, {currentUser?.name || "Admin"}!
            </Typography>
            
            <Grid container spacing={2}>
                {/* Stats Cards - Responsive Grid */}
                {[
                    { title: "Students", count: numberOfStudents, img: Students, color: "#6366f1", link: "/Admin/students" },
                    { title: "Classes", count: numberOfClasses, img: Classes, color: "#0ea5e9", link: "/Admin/classes" },
                    { title: "Teachers", count: numberOfTeachers, img: Teachers, color: "#10b981", link: "/Admin/teachers" },
                    { title: "Fees", count: totalFees, img: Fees, color: "#f59e0b", link: "/Admin/showfees", prefix: "Rs " }
                ].map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <StatCard onClick={() => navigate(item.link)}>
                            <IconCircle color={item.color}>
                                <img src={item.img} alt={item.title} />
                            </IconCircle>
                            <Box>
                                <StatLabel>{item.title}</StatLabel>
                                <Counter end={item.count} prefix={item.prefix} />
                            </Box>
                        </StatCard>
                    </Grid>
                ))}

                {/* Modernized Noticeboard */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                    <NoticeSection elevation={0}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Indicator />
                            <Typography variant="h6" sx={{ color: '#334155', fontSize: '1.1rem' }}>
                                School Noticeboard
                            </Typography>
                        </Box>
                        <NoticeScrollArea>
                            <SeeNotice />
                        </NoticeScrollArea>
                    </NoticeSection>
                </Grid>
            </Grid>
        </Container>
    );
};

/* --- COUNTER LOGIC --- */
const Counter = ({ end, prefix = "" }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const duration = 1000;
        const increment = end / (duration / 20);
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 20);
        return () => clearInterval(timer);
    }, [end]);

    return <CountValue>{prefix}{count.toLocaleString()}</CountValue>;
};

/* --- MODERN UI STYLES --- */

const StatCard = styled(Paper)`
  display: flex;
  align-items: center;
  padding: 24px;
  border-radius: 12px !important;
  border: 1px solid #eef2f6 !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02) !important;
  cursor: pointer;
  background: #ffffff !important;
  transition: all 0.2s ease-in-out;

  &:hover {
    border-color: #cbd5e1 !important;
    background-color: #fdfdfd !important;
    transform: translateY(-2px);
  }

  @media (max-width: 600px) {
    padding: 18px;
  }
`;

const IconCircle = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.color}08; /* Ultra-light tint */
  border: 1px solid ${props => props.color}20;
  margin-right: 20px;

  img {
    width: 26px;
    height: 26px;
    filter: grayscale(0.2); /* Softens the image icons for a pro look */
  }
`;

const StatLabel = styled.p`
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
  letter-spacing: 0.3px;
`;

const CountValue = styled.p`
  font-size: 1.4rem;
  color: #0f172a;
  margin: 2px 0 0 0;
  font-weight: 500;
`;

const NoticeSection = styled(Paper)`
  padding: 32px;
  border-radius: 16px !important;
  border: 1px solid #eef2f6 !important;
  background: #ffffff !important;

  @media (max-width: 600px) {
    padding: 20px;
  }
`;

const NoticeScrollArea = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding-right: 5px;

  /* Custom Scrollbar for a modern look */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
  }
`;

const Indicator = styled.div`
  width: 4px;
  height: 20px;
  background: #7c3aed;
  border-radius: 4px;
  margin-right: 12px;
`;

export default AdminHomePage;